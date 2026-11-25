import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";

import { Button, confirmEmailErrorMessage } from "@weaveui/ds";
import {
  registerAccount,
  requestPasswordReset,
  resendConfirmationEmail,
  signInAccount,
  updatePassword,
} from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { checkCompromisedPassword } from "@/lib/password-security";
import { AuthLayout } from "@/views/auth-layout";
import { PRODUCTS } from "@/lib/catalog";

const ExpiredLink = lazy(() =>
  import("@/views/expired-link/expired-link").then(({ ExpiredLink }) => ({ default: ExpiredLink })),
);
const ForgotPassword = lazy(() =>
  import("@/views/forgot-password/forgot-password").then(({ ForgotPassword }) => ({ default: ForgotPassword })),
);
const Home = lazy(() =>
  import("@/views/home/home").then(({ Home }) => ({ default: Home })),
);
const Login = lazy(() =>
  import("@/views/login/login").then(({ Login }) => ({ default: Login })),
);
const PasswordUpdated = lazy(() =>
  import("@/views/password-updated/password-updated").then(({ PasswordUpdated }) => ({ default: PasswordUpdated })),
);
const Register = lazy(() =>
  import("@/views/register/register").then(({ Register }) => ({ default: Register })),
);
const ResetPassword = lazy(() =>
  import("@/views/reset-password/reset-password").then(({ ResetPassword }) => ({ default: ResetPassword })),
);

const EMAIL_NOT_CONFIRMED =
  "Confirm your email before signing in. Check your inbox for the confirmation link.";

function StoreRoute({ showBag = false }: { showBag?: boolean }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = productId ? PRODUCTS.find((item) => item.id === productId) : undefined;
  if (productId && !product) return <Navigate to="/" replace />;
  return <Home product={product} showBag={showBag} onReview={() => navigate("/bag")} onSelectProduct={(id) => navigate(`/products/${id}`)} />;
}

function AuthLinkRedirect() {
  const { ready, linkError, clearLinkError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready || !linkError) return;
    clearLinkError();
    navigate("/expired-link", { replace: true });
  }, [ready, linkError, clearLinkError, navigate]);

  return null;
}

function LoginRoute() {
  const navigate = useNavigate();
  const { ready, loggedIn } = useAuth();
  const [notice, setNotice] = useState<string>();

  useEffect(() => {
    if (ready && loggedIn) navigate("/", { replace: true });
  }, [ready, loggedIn, navigate]);

  return (
    <Login
      logoHref="/"
      forgotPasswordHref="/forgot-password"
      signUpHref="/register"
      notice={notice}
      onSubmit={async (values) => {
        setNotice(undefined);
        const result = await signInAccount(values);
        if (result === "email-not-confirmed") {
          setNotice(EMAIL_NOT_CONFIRMED);
          return;
        }
        if (result === "signed-in") {
          navigate("/");
          return;
        }
        return result;
      }}
    />
  );
}

function RegisterRoute() {
  const navigate = useNavigate();
  const [confirmationEmail, setConfirmationEmail] = useState<string>();
  const [confirmationSubmitting, setConfirmationSubmitting] = useState(false);
  const [confirmationError, setConfirmationError] = useState<string>();

  return (
    <Register
      logoHref="/"
      loginHref="/login"
      checkCompromisedPassword={checkCompromisedPassword}
      confirmationEmail={confirmationEmail}
      confirmationSubmitting={confirmationSubmitting}
      confirmationError={confirmationError}
      onResendConfirmation={async () => {
        if (!confirmationEmail || confirmationSubmitting) return;
        setConfirmationSubmitting(true);
        setConfirmationError(undefined);
        try {
          const result = await resendConfirmationEmail(confirmationEmail);
          setConfirmationError(confirmEmailErrorMessage(result === "sent" ? undefined : result));
        } catch {
          setConfirmationError(confirmEmailErrorMessage("network"));
        } finally {
          setConfirmationSubmitting(false);
        }
      }}
      onSubmit={async (values) => {
        setConfirmationError(undefined);
        const result = await registerAccount(values);
        if (result === "confirm-email") {
          setConfirmationEmail(values.email);
          return;
        }
        if (result === "signed-in") {
          navigate("/");
          return;
        }
        return result;
      }}
    />
  );
}

function ForgotPasswordRoute() {
  return (
    <ForgotPassword
      logoHref="/"
      loginHref="/login"
      onSubmit={async ({ email }) => {
        const result = await requestPasswordReset(email);
        if (result === "sent") return;
        return result;
      }}
    />
  );
}

function ResetPasswordRoute() {
  const navigate = useNavigate();
  const { ready, loggedIn, linkError, error, logOut, retry } = useAuth();
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    // Wait until the email-link exchange finishes. "Not logged in yet" is not
    // the same as an expired link while that exchange is still running.
    if (!ready || linkError || error || completing) return;
    if (!loggedIn) navigate("/expired-link", { replace: true });
  }, [ready, loggedIn, linkError, error, completing, navigate]);

  if (error && !loggedIn) return <AuthLayout logoHref="/"><Button onClick={retry}>Try again</Button></AuthLayout>;
  if (!ready || linkError || (!loggedIn && !completing)) return null;

  return (
    <ResetPassword
      logoHref="/"
      loginHref="/login"
      forgotPasswordHref="/forgot-password"
      checkCompromisedPassword={checkCompromisedPassword}
      onSubmit={async ({ password }) => {
        const result = await updatePassword(password);
        if (result === "updated") {
          setCompleting(true);
          await logOut();
          navigate("/password-updated", { replace: true });
          return;
        }
        if (result === "expired") {
          navigate("/expired-link", { replace: true });
          return;
        }
        return result;
      }}
    />
  );
}

function PasswordUpdatedRoute() {
  const { loggedIn, logOut } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  return (
    <PasswordUpdated
      logoHref="/"
      loginHref="/login"
      description={loggedIn ? "Your password was updated. Log out to sign in with your new password." : undefined}
      actionLabel={loggedIn ? (submitting ? "Logging out…" : "Log out") : undefined}
      onAction={loggedIn ? async (event) => {
        event.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        const result = await logOut();
        setSubmitting(false);
        if (result === "signed-out") navigate("/login", { replace: true });
      } : undefined}
    />
  );
}

export function App() {
  return (
    <>
      <AuthLinkRedirect />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<StoreRoute />} />
          <Route path="/bag" element={<StoreRoute showBag />} />
          <Route path="/products/:productId" element={<StoreRoute />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/register" element={<RegisterRoute />} />
          <Route path="/forgot-password" element={<ForgotPasswordRoute />} />
          <Route path="/reset-password" element={<ResetPasswordRoute />} />
          <Route
            path="/password-updated"
            element={<PasswordUpdatedRoute />}
          />
          <Route
            path="/expired-link"
            element={<ExpiredLink logoHref="/" forgotPasswordHref="/forgot-password" />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
