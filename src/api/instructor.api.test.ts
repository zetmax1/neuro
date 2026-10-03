import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./client", () => ({ default: { delete: vi.fn() } }));

import apiClient from "./client";
import { deleteQuestion, deleteTopic } from "./instructor.api";

const del = vi.mocked(apiClient.delete);

describe("delete results (D11)", () => {
  beforeEach(() => del.mockReset());

  it("reports a real delete for 204", async () => {
    del.mockResolvedValue({ status: 204, data: "" });
    await expect(deleteTopic(5)).resolves.toEqual({ archived: false, archivedTopics: undefined });
    expect(del).toHaveBeenCalledWith("/api/curriculum/instructor/topics/5/");
  });

  it("reports an archived topic subtree", async () => {
    del.mockResolvedValue({ status: 200, data: { id: 5, archived: true, archived_topics: 3 } });
    await expect(deleteTopic(5)).resolves.toEqual({ archived: true, archivedTopics: 3 });
  });

  it("reports a deactivated question", async () => {
    del.mockResolvedValue({ status: 200, data: { id: 9, archived: true } });
    await expect(deleteQuestion(9)).resolves.toEqual({ archived: true, archivedTopics: undefined });
    expect(del).toHaveBeenCalledWith("/api/assessments/instructor/questions/9/");
  });
});
