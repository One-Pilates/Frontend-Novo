import React from 'react';
import '../pages/Login/Login.scss';

const BackgroundLogin = () => {
  return (
    <div className="background-login" aria-hidden="true">
      <svg className="background-login__svg-filter">
        <defs>
          <filter id="wave">
            <feTurbulence
              id="turb"
              type="fractalNoise"
              baseFrequency="0.01 0.02"
              numOctaves="2"
              seed="2"
            >
              <animate
                attributeName="baseFrequency"
                dur="12s"
                values="0.01 0.02; 0.02 0.03; 0.01 0.02"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="30" />
          </filter>
        </defs>
      </svg>

      <img src="/backgroundLogin.jpeg" alt="" className="background-login__img" />

      <div className="background-login__logo">
        <img src="/logoBranca.png" alt="Logo OnePilates" />
      </div>
    </div>
  );
};

export default BackgroundLogin;
