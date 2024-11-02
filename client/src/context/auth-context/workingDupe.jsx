import { createContext, useState, useEffect } from "react";
import { registerService, loginService, checkAuthService } from "@/services";
import { initialSignInFormData, initialSignUpFormData } from "@/config";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase"; // Firebase auth object
import { Skeleton } from "@/components/ui/skeleton";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
  const [authState, setAuthState] = useState({ authenticate: false, user: null });
  const [loading, setLoading] = useState(true);

  async function handleRegisterUser(event) {
    event.preventDefault();
    try {
      const data = await registerService(signUpFormData);
      console.log("Registration data:", data); // Log response for debugging
  
      if (data && data.user) {
        setAuthState({
          authenticate: true,
          user: data.user,
        });
      } else {
        console.error("User data not found in registration response:", data);
        setAuthState({
          authenticate: false,
          user: null,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setAuthState({
        authenticate: false,
        user: null,
      });
    }
  }

  async function handleLoginUser(event) {
    event.preventDefault();
    const response = await loginService(signInFormData);
    if (response.success) {
      setAuthState({ authenticate: true, user: response.data.user });
    } else {
      setAuthState({ authenticate: false, user: null });
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const authData = await checkAuthService(); // Ensure this function returns user data properly
        if (authData.success) {
          setAuthState({ authenticate: true, user: authData.data.user }); // Ensure user data is correctly set
        } else {
          setAuthState({ authenticate: false, user: null }); // Handle failure to get user data
        }
      } else {
        setAuthState({ authenticate: false, user: null });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  return (
    <AuthContext.Provider
      value={{
        signInFormData,
        setSignInFormData,
        signUpFormData,
        setSignUpFormData,
        handleRegisterUser,
        handleLoginUser,
        authState,
      }}
    >
      {loading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
}
