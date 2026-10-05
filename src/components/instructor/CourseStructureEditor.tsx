import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  MoveDown,
  MoveUp,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  createTopic,
  deleteTopic,
  getTopics,
  reorderTopic,
  updateTopic,
  type ReorderDirection,
  type TopicKind,
  type TopicResponse,
} from "@/api/instructor.api";
import PrerequisiteEditor from "@/components/instructor/PrerequisiteEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { kbErrorMessage } from "@/lib/kbError";
import { cn } from "@/lib/utils";

/**
 * Editing an existing course (D39) — the half of the constructor the wizard
 * could not do.
 *
 * Before this, renaming one topic meant walking five wizard steps, because the
 * wizard is a creation flow: it asks for a course, then its children, then
 * materials, then questions. That order is right for a new course and wrong
 * for a correction. Here the shape is the shape of the knowledge base: the
 * tree on the left, the selected node's editor on the right.
 *
 * What can be changed is exactly what the KB service accepts for one node —
 * name, slug, description, parent, kind, pass mark, question count — plus its
 * place among its siblings, which is one request so the row is never left with
 * two nodes in the same slot. The kind select offers only the changes the
 * service will take: a section holding children is not a leaf, and a topic
 * holding questions cannot become a section (Y4), so the counters that come
 * with each node decide whether the option is open and the hint says why not.
 *
 * Drag-and-drop is deliberately absent: two buttons move a node, and a
 * dropdown moves it to another parent. The prerequisite editor is the second
 * tab, so E_P can be fixed in the same screen as the tree it runs over.
 */

type Tab = "structure" | "prerequisites";

interface TreeNode extends TopicResponse {
  children: TreeNode[];
}

/** The fields of one node the editor writes; the rest of the row is read-only. */
interface Draft {
  name: string;
  slug: string;
  description: string;
  parent: number | null;
  kind: TopicKind;
  pass_mark_percentage: number;
  test_question_count: number;
}

const draftOf = (topic: TopicResponse): Draft => ({
  name: topic.name,
  slug: topic.slug,
  description: topic.description ?? "",
  parent: topic.parent ?? null,
  kind: topic.kind,
  pass_mark_percentage: topic.pass_mark_percentage,
  test_question_count: topic.test_question_count,
});

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const buildTree = (topics: TopicResponse[], rootId: number): TreeNode[] => {
  const nodes = new Map<number, TreeNode>(
    topics.map((topic) => [topic.id, { ...topic, children: [] }]),
  );
  for (const node of nodes.values()) {
    const parent = node.parent === null || node.parent === undefined ? null : nodes.get(node.parent);
    if (parent) parent.children.push(node);
  }
  for (const node of nodes.values()) {
    node.children.sort((a, b) => a.position - b.position || a.id - b.id);
  }
  const root = nodes.get(rootId);
  return root ? [root] : [];
};

const CourseStructureEditor = () => {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [tab, setTab] = useState<Tab>("structure");
  const [courseId, setCourseId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const [draft, setDraft] = useState<Draft | null>(null);
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState<Exclude<TopicKind, "course">>("topic");

  const topics = useQuery({ queryKey: ["instructor", "topics"], queryFn: getTopics });

  const courses = useMemo(
    () => (topics.data ?? []).filter((topic) => topic.kind === "course"),
    [topics.data],
  );

  // The first course is selected on load so the editor is never empty when
  // there is something to edit.
  useEffect(() => {
    if (courseId === null && courses.length > 0) setCourseId(courses[0].id);
  }, [courseId, courses]);

  const tree = useMemo(
    () => (courseId === null ? [] : buildTree(topics.data ?? [], courseId)),
    [topics.data, courseId],
  );

  const selected = useMemo(
    () => (topics.data ?? []).find((topic) => topic.id === selectedId) ?? null,
    [topics.data, selectedId],
  );

  // The draft follows the selection, and a reload after a save refreshes it.
  useEffect(() => {
    setDraft(selected ? draftOf(selected) : null);
  }, [selected]);

  const refresh = () => {
    void client.invalidateQueries({ queryKey: ["instructor", "topics"] });
    for (const key of [
      ["curriculum", "prerequisite-graph"],
      ["curriculum", "leaf-edges"],
      ["learning-path", "tree"],
    ]) {
      void client.invalidateQueries({ queryKey: key });
    }
  };

  const save = useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: Partial<Draft> }) =>
      updateTopic(id, changes),
    onSuccess: () => {
      toast.success(t("common.saved"));
      refresh();
    },
    onError: (error) => toast.error(kbErrorMessage(error, t)),
  });

  const move = useMutation({
    mutationFn: ({ id, direction }: { id: number; direction: ReorderDirection }) =>
      reorderTopic(id, direction),
    onSuccess: () => {
      toast.success(t("builder.moved"));
      refresh();
    },
    onError: (error) => toast.error(kbErrorMessage(error, t)),
  });

  const add = useMutation({
    mutationFn: ({ parent, name, kind }: { parent: number; name: string; kind: TopicKind }) =>
      createTopic({ name, slug: slugify(name), parent, kind }),
    onSuccess: (created) => {
      setAddingTo(null);
      setNewName("");
      setSelectedId(created.id);
      refresh();
    },
    onError: (error) => toast.error(kbErrorMessage(error, t)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteTopic(id),
    onSuccess: (result, id) => {
      toast.success(result.archived ? t("builder.archived") : t("builder.deleted"));
      if (selectedId === id) setSelectedId(null);
      if (courseId === id) setCourseId(null);
      refresh();
    },
    onError: (error) => toast.error(kbErrorMessage(error, t)),
  });

  if (topics.isLoading) return <Skeleton className="h-[60vh] w-full" />;

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          {t("builder.no_courses")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="course-structure-editor">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold text-muted-foreground" htmlFor="course-select">
          {t("builder.select_course")}
        </label>
        <select
          id="course-select"
          value={courseId ?? ""}
          onChange={(event) => {
            setCourseId(event.target.value ? Number(event.target.value) : null);
            setSelectedId(null);
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          data-testid="course-select"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>

        <div className="ml-auto flex gap-1">
          {(["structure", "prerequisites"] as Tab[]).map((option) => (
            <Button
              key={option}
              size="sm"
              variant={tab === option ? "default" : "outline"}
              onClick={() => setTab(option)}
              data-testid={`tab-${option}`}
            >
              {t(option === "structure" ? "builder.tab_structure" : "builder.tab_prerequisites")}
            </Button>
          ))}
        </div>
      </div>

      {tab === "prerequisites" ? (
        <PrerequisiteEditor courseId={courseId} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("builder.outline")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {tree.map((node) => (
                <Branch
                  key={node.id}
                  node={node}
                  siblings={tree}
                  depth={0}
                  selectedId={selectedId}
                  collapsed={collapsed}
                  pending={move.isPending}
                  onSelect={setSelectedId}
                  onToggle={(id) => setCollapsed((state) => ({ ...state, [id]: !state[id] }))}
                  onMove={(id, direction) => move.mutate({ id, direction })}
                  onAddChild={(id) => {
                    setAddingTo(id);
                    setNewName("");
                    setNewKind("topic");
                  }}
                />
              ))}

              {addingTo !== null && (
                <form
                  className="mt-3 space-y-2 rounded-md border border-border bg-muted/30 p-3"
                  data-testid="add-child-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (newName.trim().length < 2) return;
                    add.mutate({ parent: addingTo, name: newName.trim(), kind: newKind });
                  }}
                >
                  <Input
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder={t("builder.field_name")}
                    aria-label={t("builder.field_name")}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <select
                      value={newKind}
                      onChange={(event) =>
                        setNewKind(event.target.value as Exclude<TopicKind, "course">)
                      }
                      className="h-9 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                      aria-label={t("builder.field_kind")}
                    >
                      <option value="topic">{t("kind.topic")}</option>
                      <option value="section">{t("kind.section")}</option>
                    </select>
                    <Button type="submit" size="sm" disabled={add.isPending}>
                      {add.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : (
                        t("common.add")
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setAddingTo(null)}
                    >
                      {t("common.cancel")}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("builder.editor")}</CardTitle>
            </CardHeader>
            <CardContent>
              {selected && draft ? (
                <NodeEditor
                  topic={selected}
                  draft={draft}
                  parents={(topics.data ?? []).filter(
                    (candidate) => candidate.id !== selected.id && candidate.kind !== "topic",
                  )}
                  saving={save.isPending}
                  deleting={remove.isPending}
                  onChange={setDraft}
                  onSave={() => save.mutate({ id: selected.id, changes: draft })}
                  onDelete={() => {
                    if (window.confirm(t("builder.confirm_delete", { name: selected.name }))) {
                      remove.mutate(selected.id);
                    }
                  }}
                />
              ) : (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  {t("builder.select_node")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

/** One row of the outline, with its subtree below it. */
const Branch = ({
  node,
  siblings,
  depth,
  selectedId,
  collapsed,
  pending,
  onSelect,
  onToggle,
  onMove,
  onAddChild,
}: {
  node: TreeNode;
  siblings: TreeNode[];
  depth: number;
  selectedId: number | null;
  collapsed: Record<number, boolean>;
  pending: boolean;
  onSelect: (id: number) => void;
  onToggle: (id: number) => void;
  onMove: (id: number, direction: ReorderDirection) => void;
  onAddChild: (id: number) => void;
}) => {
  const { t } = useTranslation();
  const index = siblings.findIndex((sibling) => sibling.id === node.id);
  const isSelected = node.id === selectedId;
  const hasChildren = node.children.length > 0;
  const isCollapsed = collapsed[node.id] ?? false;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 rounded-md px-2 py-1.5 text-sm",
          isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/60",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        data-testid={`outline-node-${node.id}`}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            className="text-muted-foreground"
            aria-label={t(isCollapsed ? "common.show" : "common.hide")}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="min-w-0 flex-1 truncate text-left font-medium"
        >
          {node.name}
        </button>

        <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
          {t(`kind.${node.kind}`)}
        </span>

        <div className="flex shrink-0 items-center">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            disabled={pending || index <= 0}
            onClick={() => onMove(node.id, "up")}
            title={t("builder.move_up")}
            aria-label={t("builder.move_up")}
            data-testid={`move-up-${node.id}`}
          >
            <MoveUp className="h-3.5 w-3.5" aria-hidden />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            disabled={pending || index < 0 || index >= siblings.length - 1}
            onClick={() => onMove(node.id, "down")}
            title={t("builder.move_down")}
            aria-label={t("builder.move_down")}
            data-testid={`move-down-${node.id}`}
          >
            <MoveDown className="h-3.5 w-3.5" aria-hidden />
          </Button>
          {/* Topics are leaves (Y4), so only a course or a section takes children. */}
          {node.kind !== "topic" && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => onAddChild(node.id)}
              title={t("builder.add_child")}
              aria-label={t("builder.add_child")}
              data-testid={`add-child-${node.id}`}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
            </Button>
          )}
        </div>
      </div>

      {hasChildren && !isCollapsed && (
        <div>
          {node.children.map((child) => (
            <Branch
              key={child.id}
              node={child}
              siblings={node.children}
              depth={depth + 1}
              selectedId={selectedId}
              collapsed={collapsed}
              pending={pending}
              onSelect={onSelect}
              onToggle={onToggle}
              onMove={onMove}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/** The selected node's fields; the kind select offers only accepted changes. */
const NodeEditor = ({
  topic,
  draft,
  parents,
  saving,
  deleting,
  onChange,
  onSave,
  onDelete,
}: {
  topic: TopicResponse;
  draft: Draft;
  parents: TopicResponse[];
  saving: boolean;
  deleting: boolean;
  onChange: (draft: Draft) => void;
  onSave: () => void;
  onDelete: () => void;
}) => {
  const { t } = useTranslation();
  const children = topic.child_count ?? 0;
  const questions = topic.question_count ?? 0;

  const isCourse = topic.kind === "course";
  // A section with children is not a leaf; a topic with questions is not a
  // container (Y4). The hint reuses the wording of the matching rejection.
  const blocked = isCourse
    ? "builder.kind_locked"
    : topic.kind === "section" && children > 0
      ? "kb_error.has_children"
      : topic.kind === "topic" && questions > 0
        ? "kb_error.has_questions"
        : null;

  const field = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    onChange({ ...draft, [key]: value });

  return (
    <form
      className="space-y-3"
      data-testid="node-editor"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
        <span>#{topic.id}</span>
        <span>{t("builder.children_count", { count: children })}</span>
        {topic.kind === "topic" && <span>{t("builder.questions_count", { count: questions })}</span>}
      </p>

      <Labelled label={t("builder.field_name")} htmlFor="node-name">
        <Input
          id="node-name"
          value={draft.name}
          onChange={(event) => field("name", event.target.value)}
          required
          minLength={2}
        />
      </Labelled>

      <Labelled label={t("builder.field_slug")} htmlFor="node-slug">
        <Input
          id="node-slug"
          value={draft.slug}
          onChange={(event) => field("slug", event.target.value)}
          required
        />
      </Labelled>

      <Labelled label={t("builder.field_description")} htmlFor="node-description">
        <Textarea
          id="node-description"
          rows={3}
          value={draft.description}
          onChange={(event) => field("description", event.target.value)}
        />
      </Labelled>

      <Labelled label={t("builder.field_kind")} htmlFor="node-kind">
        <select
          id="node-kind"
          value={draft.kind}
          disabled={blocked !== null}
          onChange={(event) => field("kind", event.target.value as TopicKind)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-60"
          data-testid="node-kind"
        >
          {isCourse ? (
            <option value="course">{t("kind.course")}</option>
          ) : (
            <>
              <option value="topic">{t("kind.topic")}</option>
              <option value="section">{t("kind.section")}</option>
            </>
          )}
        </select>
        {blocked && <p className="mt-1 text-xs text-muted-foreground">{t(blocked)}</p>}
      </Labelled>

      {/* A course is exactly a root, so its parent is not offered. */}
      {!isCourse && (
        <Labelled label={t("builder.field_parent")} htmlFor="node-parent">
          <select
            id="node-parent"
            value={draft.parent ?? ""}
            onChange={(event) =>
              field("parent", event.target.value ? Number(event.target.value) : null)
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            data-testid="node-parent"
          >
            {parents.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </select>
        </Labelled>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Labelled label={t("builder.field_pass_mark")} htmlFor="node-pass-mark">
          <Input
            id="node-pass-mark"
            type="number"
            min={0}
            max={100}
            value={draft.pass_mark_percentage}
            onChange={(event) => field("pass_mark_percentage", Number(event.target.value))}
          />
        </Labelled>
        <Labelled label={t("builder.field_question_count")} htmlFor="node-question-count">
          <Input
            id="node-question-count"
            type="number"
            min={1}
            value={draft.test_question_count}
            onChange={(event) => field("test_question_count", Number(event.target.value))}
          />
        </Labelled>
      </div>

      <div className="flex items-center justify-between pt-1">
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={onDelete}
          disabled={deleting || saving}
          data-testid="delete-node"
        >
          {deleting ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          )}
          {t("common.delete")}
        </Button>
        <Button type="submit" size="sm" disabled={saving} data-testid="save-node">
          {saving ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Save className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          )}
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
};

const Labelled = ({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) => (
  <div>
    <label className="mb-1 block text-xs font-semibold text-muted-foreground" htmlFor={htmlFor}>
      {label}
    </label>
    {children}
  </div>
);

export default CourseStructureEditor;
