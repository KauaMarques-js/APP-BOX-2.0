import React from "react";

function StepIndicator({ currentStep }) {
  return (
    <div className="step-indicator">
      {[1, 2, 3].map((s) => (
        <div key={s} className={`step ${currentStep === s ? "active" : ""}`}></div>
      ))}
    </div>
  );
}

export default StepIndicator;
