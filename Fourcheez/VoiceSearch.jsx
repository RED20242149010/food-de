
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VoiceSearch.css";

const suggestions = [
  "Loaded Ultimate Box with double cheese",
  "Any baked pasta under 300 Taka",
  "Vegetarian options at Khulna New Market",
  "Crispy Chicken Burger with French Fries combo",
];

function VoiceSearch() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const startListening = () => {
    setError("");

    if (!SpeechRecognition) {
      setError(
        "Voice search is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setListening(true);
        setTranscript("");
      };

      recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalText += text;
          } else {
            interimText += text;
          }
        }

        setTranscript(finalText || interimText);
      };

      recognition.onerror = (event) => {
        setListening(false);

        if (event.error === "not-allowed") {
          setError("Please allow microphone access to use voice search.");
        } else if (event.error === "no-speech") {
          setError("No speech detected. Please try speaking again.");
        } else {
          setError("Voice search could not start. Please try again.");
        }
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } catch (err) {
      setListening(false);
      setError("Could not start the microphone. Please try again.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setListening(false);
  };

  const searchMenu = (text) => {
    const query = text.trim();

    if (!query) {
      setError("Please say something or choose a suggestion.");
      return;
    }

    stopListening();
    navigate(`/menu?search=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <main className="voice-search-page">
      <section className="voice-search-container">
        <h1>Search 4Cheez with your Voice</h1>

        <button
          type="button"
          className={`voice-microphone ${listening ? "is-listening" : ""}`}
          onClick={listening ? stopListening : startListening}
          aria-label={listening ? "Stop voice search" : "Start voice search"}
        >
          <span className="sound-wave wave-left">
            <i />
            <i />
            <i />
          </span>

          <span className="microphone-circle">
            <svg
              viewBox="0 0 24 24"
              width="34"
              height="34"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="2" width="6" height="13" rx="3" />
              <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
              <path d="M12 19v3" />
              <path d="M8 22h8" />
            </svg>
          </span>

          <span className="sound-wave wave-right">
            <i />
            <i />
            <i />
          </span>
        </button>

        <div className="voice-result">
          <h2>
            {listening
              ? "Listening..."
              : transcript
                ? `"${transcript}"`
                : '"Show me Loaded Cheez Boxes under ৳300..."'}
          </h2>

          <p>
            {listening
              ? "Speak now. I'm listening for your food search."
              : "Listening for food names, budget, or ingredients"}
          </p>
        </div>

        <div className="voice-actions">
          {listening ? (
            <button
              type="button"
              className="stop-listening-btn"
              onClick={stopListening}
            >
              Stop Listening
            </button>
          ) : (
            <button
              type="button"
              className="stop-listening-btn"
              onClick={startListening}
            >
              Try Again
            </button>
          )}

          {transcript && !listening && (
            <button
              type="button"
              className="voice-search-submit"
              onClick={() => searchMenu(transcript)}
            >
              Search Menu
            </button>
          )}
        </div>

        {error && (
          <p className="voice-error" role="alert">
            {error}
          </p>
        )}

        <section className="voice-suggestions">
          <h3>Try Saying Something Like</h3>

          <div className="suggestion-list">
            {suggestions.map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                onClick={() => searchMenu(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </section>

        <div className="voice-privacy">
          <span aria-hidden="true">🛡️</span>
          <p>
            Voice input is handled through your browser's speech
            recognition service. 4Cheez does not store a voice
            recording.
          </p>
        </div>
      </section>
    </main>
  );
}

export default VoiceSearch;
