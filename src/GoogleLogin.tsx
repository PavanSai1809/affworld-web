import React from "react";
import { isEmpty } from 'lodash';
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

interface GoogleUsersProps {
  onLoginSuccess: () => void;
}

const GoogleUsers: React.FC<GoogleUsersProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const decoded = JSON.parse(atob(credentialResponse.credential.split(".")[1]));
      const userMail = decoded.email;
      const response = await fetch(
        `https://affworld-services-1.onrender.com/api/v1/user/validate-email?email=${userMail}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (isEmpty(data?.result)) {
          const params = {
            name: decoded.name,
            email: userMail,
            google_id: decoded.sub
          };
          const response = await fetch('https://affworld-services-1.onrender.com/api/v1/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
          });
          const getData = await response.json();
          localStorage.setItem("authToken", getData.result);

          if (response.ok) {
            onLoginSuccess();
          }
        } else {
          const loginParams = {
            email: userMail,
            google_id: decoded.sub
          };

          const loginResponse = await fetch(
            "https://affworld-services-1.onrender.com/api/v1/user/login",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(loginParams),
            }
          );

          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            const { result } = loginData;
            localStorage.setItem("authToken", result);

            onLoginSuccess();
          } else {
            console.error("Login failed");
          }
        }
      }
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const handleGoogleFailure = () => {
    console.error("Google login failed.");
  };

  return (
    <div className="flex justify-center items-center">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleFailure}
      />
    </div>
  );
};

export default GoogleUsers;
