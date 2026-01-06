import { Link } from "react-router-dom";

export default function Signup() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p>Start a pre-release security review in minutes.</p>
        <label>
          Email
          <input type="email" placeholder="you@company.com" />
        </label>
        <label>
          Password
          <input type="password" placeholder="Create a password" />
        </label>
        <label>
          Confirm password
          <input type="password" placeholder="Repeat your password" />
        </label>
        <button className="button primary" type="button">
          Create account
        </button>
        <Link className="link" to="/login">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
