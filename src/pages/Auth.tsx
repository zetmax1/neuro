import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, ArrowRight, BookOpen, Loader2 } from "lucide-react";

/* ─── Zod Schemas ─────────────────────────────────────────────────────── */

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z
  .object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/\d/, "Must contain at least one number")
      .regex(/[\W_]/, "Must contain at least one special character"),
    password_confirm: z.string(),
    // D42: off unless the learner ticks it. Registration must work without it.
    research_consent: z.boolean().default(false),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: "Passwords don't match",
    path: ["password_confirm"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

/* ─── Component ───────────────────────────────────────────────────────── */

const Auth = () => {
  const { t } = useTranslation();
  const [isSignup, setIsSignup] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { login, signup } = useAuthContext();
  const navigate = useNavigate();

  // ── Login form ──
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // ── Signup form ──
  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      password_confirm: "",
      research_consent: false,
    },
  });

  // Active form helpers
  const activeForm = isSignup ? signupForm : loginForm;
  const { formState: { isSubmitting } } = activeForm;

  /* ── Handlers ─────────────────────────────────────────────────────────── */

  const handleLogin = async (data: LoginValues) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (
        msg.toLowerCase().includes("no active account") ||
        msg.toLowerCase().includes("invalid") ||
        msg.includes("401")
      ) {
        setServerError(t("auth.login_failed"));
      } else {
        setServerError(msg || t("auth.login_failed"));
      }
    }
  };

  const handleSignup = async (data: SignupValues) => {
    setServerError(null);
    try {
      await signup({
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
        first_name: data.first_name,
        last_name: data.last_name,
        research_consent: data.research_consent,
      });
      // Don't auto-login; switch to sign-in view with success banner
      setSuccessMessage(t("auth.signup_done"));
      signupForm.reset();
      setIsSignup(false);
    } catch (err: unknown) {
      // Try to parse Django DRF field-level errors
      try {
        const parsed = JSON.parse(err instanceof Error ? err.message : "{}");
        let hasField = false;

        Object.entries(parsed).forEach(([key, value]) => {
          if (["first_name", "last_name", "email", "password", "password_confirm"].includes(key)) {
            signupForm.setError(key as keyof SignupValues, {
              type: "server",
              message: Array.isArray(value) ? (value as string[])[0] : String(value),
            });
            hasField = true;
          }
        });

        if (!hasField) {
          setServerError(t("auth.signup_failed"));
        }
      } catch {
        setServerError(err instanceof Error ? err.message : t("auth.signup_failed"));
      }
    }
  };

  const switchMode = () => {
    setIsSignup(!isSignup);
    setServerError(null);
    setSuccessMessage(null);
    loginForm.reset();
    signupForm.reset();
  };

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[20%] left-[15%] w-64 h-64 rounded-full border border-white/30" />
          <div className="absolute bottom-[25%] right-[10%] w-48 h-48 rounded-full border border-white/20" />
          <div className="absolute top-[50%] left-[50%] w-32 h-32 rounded-full border border-white/15" />
        </div>
        <div className="relative z-10 max-w-md text-center px-8">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 font-display">
            NeuroLearn
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-8">
            An intelligent learning companion that adapts to the way you think, not the other way around.
          </p>
          <div className="flex flex-col gap-3 text-left">
            {[
              { icon: BookOpen, text: "Personalized learning paths" },
              { icon: ArrowRight, text: "Adaptive assessments that grow with you" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              Neuro<span className="text-primary">Learn</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isSignup ? t("auth.signup_title") : t("auth.login_title")}
            </h2>
          </div>

          {/* ─ Success banner ─ */}
          {successMessage && !isSignup && (
            <div className="mb-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
            </div>
          )}

          {/* ─ Error banner ─ */}
          {serverError && (
            <div className="mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{serverError}</p>
            </div>
          )}

          {/* ────────────────── SIGN-UP FORM ────────────────── */}
          {isSignup ? (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="first_name" className="text-sm">{t("auth.first_name")}</Label>
                  <Input
                    id="first_name"
                    {...signupForm.register("first_name")}
                    placeholder="John"
                    className={`h-11 ${signupForm.formState.errors.first_name ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                  />
                  {signupForm.formState.errors.first_name && (
                    <p className="text-xs text-red-500">{signupForm.formState.errors.first_name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last_name" className="text-sm">{t("auth.last_name")}</Label>
                  <Input
                    id="last_name"
                    {...signupForm.register("last_name")}
                    placeholder="Doe"
                    className={`h-11 ${signupForm.formState.errors.last_name ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                  />
                  {signupForm.formState.errors.last_name && (
                    <p className="text-xs text-red-500">{signupForm.formState.errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-email" className="text-sm">{t("auth.email")}</Label>
                <Input
                  id="signup-email"
                  type="email"
                  {...signupForm.register("email")}
                  placeholder="you@example.com"
                  className={`h-11 ${signupForm.formState.errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                {signupForm.formState.errors.email && (
                  <p className="text-xs text-red-500">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-password" className="text-sm">{t("auth.password")}</Label>
                <Input
                  id="signup-password"
                  type="password"
                  {...signupForm.register("password")}
                  placeholder="••••••••"
                  className={`h-11 ${signupForm.formState.errors.password ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                {signupForm.formState.errors.password && (
                  <p className="text-xs text-red-500">{signupForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password_confirm" className="text-sm">{t("auth.password_confirm")}</Label>
                <Input
                  id="password_confirm"
                  type="password"
                  {...signupForm.register("password_confirm")}
                  placeholder="••••••••"
                  className={`h-11 ${signupForm.formState.errors.password_confirm ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                {signupForm.formState.errors.password_confirm && (
                  <p className="text-xs text-red-500">{signupForm.formState.errors.password_confirm.message}</p>
                )}
              </div>

              {/*
                D42: research consent, optional and off unless ticked. The
                four facts it has to state are in the dictionary, including
                that an export already produced is not rewritten when consent
                is withdrawn — an assurance the backend cannot keep is not one
                worth printing.
              */}
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <label className="flex items-start gap-2.5 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    {...signupForm.register("research_consent")}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary"
                    data-testid="signup-consent"
                  />
                  <span className="font-medium leading-snug">{t("consent.short")}</span>
                </label>
                <ul className="space-y-0.5 pl-7 text-xs text-muted-foreground">
                  <li>{t("consent.what")}</li>
                  <li>{t("consent.why")}</li>
                  <li>{t("consent.anonymous")}</li>
                  <li>{t("consent.optional")}</li>
                  <li>{t("consent.revoke")}</li>
                  <li>{t("consent.deleted_account")}</li>
                </ul>
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("auth.signup")}
                  </>
                ) : (
                  <>
                    {t("auth.signup")}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* ────────────────── SIGN-IN FORM ────────────────── */
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  {...loginForm.register("email")}
                  placeholder="you@example.com"
                  className={`h-11 ${loginForm.formState.errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-red-500">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  {...loginForm.register("password")}
                  placeholder="••••••••"
                  className={`h-11 ${loginForm.formState.errors.password ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-red-500">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("auth.login")}
                  </>
                ) : (
                  <>
                    {t("auth.login")}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? t("auth.have_account") : t("auth.no_account")}{" "}
            <button
              onClick={switchMode}
              className="text-primary font-medium hover:underline"
            >
              {isSignup ? t("auth.login") : t("auth.signup")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
