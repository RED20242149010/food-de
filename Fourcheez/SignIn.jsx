import "./SignIn.css";

function SignIn() {
  return (
    <div className="signin-page">

      {/* LEFT SIDE */}
      <div className="signin-left">

        <div className="signin-logo">
          <span className="logo-box">4</span>
          <span>cheez</span>
        </div>

        <h1>The cheese never stops.</h1>

        <p>
          Join our premium cheesiness club. Save your default
          locations, customize your boxes with one tap, and get
          exclusive access to new loaded recipe releases.
        </p>

        <img
          src="/src/assets/cheese-bomb-loaded-fries.png"
          alt="Cheese Bomb Loaded Fries"
          className="signin-food-image"
        />

      </div>


      {/* RIGHT SIDE */}
      <div className="signin-right">

        <h2>Welcome to 4Cheez</h2>

        <p className="signin-subtitle">
          Enter your credentials to access your cheese stash.
        </p>


        {/* EMAIL */}
        <label htmlFor="email">
          Email or Phone Number
        </label>

        <input
          id="email"
          type="text"
          placeholder="hello@example.com"
        />


        {/* PASSWORD */}
        <div className="password-label">
          <label htmlFor="password">
            Password
          </label>

          <a href="#">
            Forgot Password?
          </a>
        </div>

        <input
          id="password"
          type="password"
          placeholder="••••••••••••"
        />


        {/* REMEMBER ME */}
        <div className="remember-me">

          <input
            type="checkbox"
            id="remember"
            defaultChecked
          />

          <label htmlFor="remember">
            Keep me signed in to this computer
          </label>

        </div>


        {/* SIGN IN BUTTON */}
        <button className="signin-button">
          Sign In
        </button>


        {/* GOOGLE BUTTON */}
        <button className="google-button">
          ⓖ &nbsp; Continue with Google
        </button>


        {/* CREATE ACCOUNT */}
        <p className="create-account">
          New to 4Cheez?

          <a href="#">
            Create an account
          </a>
        </p>

      </div>

    </div>
  );
}

export default SignIn;