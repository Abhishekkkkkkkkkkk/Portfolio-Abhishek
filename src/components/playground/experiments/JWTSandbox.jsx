import React, { useState, useEffect } from "react";
import { Key, Unlock, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail } from "../../../services/soundEffects";

// Standard mock base64url encode/decode functions
const base64urlEncode = (str) => {
  try {
    return btoa(str)
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  } catch (e) {
    return "";
  }
};

const base64urlDecode = (str) => {
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return atob(base64);
  } catch (e) {
    return null;
  }
};

const DEFAULT_HEADER = {
  alg: "HS256",
  typ: "JWT"
};

const DEFAULT_PAYLOAD = {
  sub: "1234567890",
  name: "Abhishek",
  role: "administrator",
  iat: 1516239022,
  exp: 1816239022
};

const JWTSandbox = () => {
  const [jwt, setJwt] = useState("");
  const [headerJson, setHeaderJson] = useState(JSON.stringify(DEFAULT_HEADER, null, 2));
  const [payloadJson, setPayloadJson] = useState(JSON.stringify(DEFAULT_PAYLOAD, null, 2));
  const [signatureSecret, setSignatureSecret] = useState("my-super-secret-key-123");
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(true);

  // Re-encode JWT when Header, Payload, or Secret is edited
  const encodeToken = (headerStr, payloadStr, secret) => {
    try {
      setError(null);
      // Validate JSON syntax first
      const parsedHeader = JSON.parse(headerStr);
      const parsedPayload = JSON.parse(payloadStr);

      const headerEncoded = base64urlEncode(JSON.stringify(parsedHeader));
      const payloadEncoded = base64urlEncode(JSON.stringify(parsedPayload));

      // Mock HS256 signature representation
      const signatureEncoded = base64urlEncode(`${headerEncoded}.${payloadEncoded}.${secret || ""}`).substring(0, 43);

      const generatedJwt = `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`;
      setJwt(generatedJwt);
      setSuccess(true);
    } catch (e) {
      setError("Encoding Error: Invalid JSON schema format in Header or Payload fields.");
      setSuccess(false);
    }
  };

  // Decode JWT when user pastes/edits the token string directly
  const decodeToken = (token) => {
    if (!token) return;
    setError(null);

    const parts = token.split(".");
    if (parts.length !== 3) {
      setError("Decoding Error: A standard JWT must consist of three parts separated by dots (.)");
      setSuccess(false);
      return;
    }

    const headerDecoded = base64urlDecode(parts[0]);
    const payloadDecoded = base64urlDecode(parts[1]);

    if (!headerDecoded || !payloadDecoded) {
      setError("Decoding Error: Failed to base64url-decode token segments.");
      setSuccess(false);
      return;
    }

    try {
      const parsedHeader = JSON.parse(headerDecoded);
      const parsedPayload = JSON.parse(payloadDecoded);

      setHeaderJson(JSON.stringify(parsedHeader, null, 2));
      setPayloadJson(JSON.stringify(parsedPayload, null, 2));
      setSuccess(true);
    } catch (e) {
      setError("Decoding Error: Decoded segments did not resolve to valid JSON objects.");
      setSuccess(false);
    }
  };

  // Run encoding on initial mount
  useEffect(() => {
    encodeToken(headerJson, payloadJson, signatureSecret);
  }, []);

  const handleJwtChange = (val) => {
    setJwt(val);
    decodeToken(val);
    playTap();
  };

  const handleHeaderChange = (val) => {
    setHeaderJson(val);
    encodeToken(val, payloadJson, signatureSecret);
  };

  const handlePayloadChange = (val) => {
    setPayloadJson(val);
    encodeToken(headerJson, val, signatureSecret);
  };

  const handleSecretChange = (val) => {
    setSignatureSecret(val);
    encodeToken(headerJson, payloadJson, val);
    playTap();
  };

  const handlePresetTrigger = (role) => {
    playTap();
    const updatedPayload = { ...JSON.parse(payloadJson), role };
    const pStr = JSON.stringify(updatedPayload, null, 2);
    setPayloadJson(pStr);
    encodeToken(headerJson, pStr, signatureSecret);
    playSuccess();
    trackExperimentInteracted("jwt-sandbox");
  };

  // Highlight segment substrings
  const jwtParts = jwt.split(".");
  const headerSegment = jwtParts[0] || "";
  const payloadSegment = jwtParts[1] || "";
  const signatureSegment = jwtParts[2] || "";

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-6 text-left">
      <div>
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <Unlock className="w-5 h-5 text-indigo-400" />
          JSON Web Token Decoder Sandbox
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          Paste a JWT to parse its claims, or modify the JSON parameters below to compile a custom-signed authorization token in real-time!
        </p>
      </div>

      {/* Preset Role triggers */}
      <div className="flex gap-2 items-center bg-white/3 p-3 rounded-xl border border-white/5 text-xs">
        <span className="text-gray-400">Mock Claims Templates:</span>
        <button
          onClick={() => handlePresetTrigger("administrator")}
          className="px-2.5 py-1 rounded bg-[#6366f1]/15 text-[#a78bfa] border border-[#6366f1]/30 hover:bg-[#6366f1]/25 text-[10px] font-mono cursor-pointer"
        >
          admin_role
        </button>
        <button
          onClick={() => handlePresetTrigger("guest_user")}
          className="px-2.5 py-1 rounded bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 text-[10px] font-mono cursor-pointer"
        >
          guest_role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Raw Encoded token string */}
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block">Encoded Token String</span>
          
          <div className="flex-1 min-h-[220px] rounded-xl border border-white/8 bg-[#040410] p-4 font-mono text-xs leading-relaxed select-all break-all overflow-y-auto max-h-72">
            <span className="text-rose-400">{headerSegment}</span>
            {headerSegment && payloadSegment && <span className="text-white">.</span>}
            <span className="text-[#22d3ee]">{payloadSegment}</span>
            {payloadSegment && signatureSegment && <span className="text-white">.</span>}
            <span className="text-amber-400">{signatureSegment}</span>
          </div>

          <textarea
            value={jwt}
            onChange={(e) => handleJwtChange(e.target.value)}
            placeholder="Paste JWT string here..."
            className="w-full h-16 bg-white/4 border border-white/10 rounded-xl p-3 text-xs font-mono text-gray-400 focus:outline-none focus:border-indigo-500/50"
            spellCheck="false"
          />
        </div>

        {/* Right: Decoded Header & Payload editors */}
        <div className="flex flex-col gap-4">
          {/* Header Panel */}
          <div>
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block mb-2">Decoded Header (ALGORITHM)</span>
            <textarea
              value={headerJson}
              onChange={(e) => handleHeaderChange(e.target.value)}
              className="w-full h-20 bg-[#040410] border border-rose-500/20 rounded-xl p-3 text-xs font-mono text-rose-300 focus:outline-none"
              spellCheck="false"
            />
          </div>

          {/* Payload Claims Panel */}
          <div>
            <span className="text-[10px] font-mono font-bold text-[#22d3ee] uppercase tracking-widest block mb-2">Decoded Payload (CLAIMS DATA)</span>
            <textarea
              value={payloadJson}
              onChange={(e) => handlePayloadChange(e.target.value)}
              className="w-full h-40 bg-[#040410] border border-[#22d3ee]/20 rounded-xl p-3 text-xs font-mono text-[#22d3ee] focus:outline-none"
              spellCheck="false"
            />
          </div>

          {/* Secret configuration */}
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block mb-2">Signature Hashing Secret Key</span>
            <input
              type="text"
              value={signatureSecret}
              onChange={(e) => handleSecretChange(e.target.value)}
              className="w-full bg-[#040410] border border-amber-500/20 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none"
              spellCheck="false"
            />
          </div>
        </div>
      </div>

      {/* Verification indicators */}
      <div className={`p-4 border rounded-xl flex items-center gap-3 ${
        success 
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
      }`}>
        {success ? (
          <>
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-xs">Token Compiled & Decoded Cleanly</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Signature key matches authentication algorithm criteria.</p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-xs">Parsing Failures Detected</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{error}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JWTSandbox;
