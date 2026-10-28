import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";

function SignUp() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (event) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      alert("Please fill in name, email and password.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("Signup status:", response.status);
      console.log("Signup response:", data);

      if (response.ok) {
        alert("Account created successfully!");

        setName("");
        setEmail("");
        setPhone("");
        setPassword("");

        // Redirect to the Home page after signup
        navigate("/");
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("SIGNUP ERROR:", error);

      alert(
        "Cannot connect to the server. Make sure the backend is running."
      );
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-logo">
          <span>4</span>
          <strong>cheez</strong>
        </div>

        <h1>Create Your Account</h1>

        <p className="signup-subtitle">
          Join the 4Cheez family and enjoy cheesy goodness.
        </p>

        <form onSubmit={handleSignup}>
          <label htmlFor="name">Name</label>

          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <label htmlFor="email">Email</label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="hello@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="phone">Phone Number</label>

          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="01712345678"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
          />

          <button
            type="submit"
            className="signup-button"
          >
            Create Account
          </button>
        </form>

        <p className="already-account">
          Already have an account?

          <button
            type="button"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignUp;