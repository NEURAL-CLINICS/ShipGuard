import { Link } from "react-router-dom";

export default function Reset() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Reset your password</h1>
        <p>We will send reset instructions to your inbox.</p>
        <label>
          Email
          <input type="email" placeholder="you@company.com" />
        </label>
        <button className="button primary" type="button">
          Send reset link
        </button>
        <Link className="link" to="/login">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
