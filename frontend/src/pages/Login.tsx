import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>ShipGuard</h1>
        <p>Sign in to review your pre-release security posture.</p>
        <label>
          Email
          <input type="email" placeholder="you@company.com" />
        </label>
        <label>
          Password
          <input type="password" placeholder="Password" />
        </label>
        <button className="button primary" type="button">
          Sign in
        </button>
        <Link className="link" to="/dashboard">
          Continue to demo workspace
        </Link>
      </div>
    </div>
  );
}
