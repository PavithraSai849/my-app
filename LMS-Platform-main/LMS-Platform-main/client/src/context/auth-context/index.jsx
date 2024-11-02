import { createContext, useState, useEffect } from "react";
import { registerService, loginService, checkAuthService, testUserCollectionAccess } from "@/services";
import { initialSignInFormData, initialSignUpFormData } from "@/config";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
  const [authState, setAuthState] = useState({
    authenticate: false,
    user: null,
    role: null,
  });
  const [loading, setLoading] = useState(true);

  async function handleRegisterUser(event) {
    event.preventDefault();
    try {
      const data = await registerService(signUpFormData);
      if (data && data.user) {
        setAuthState({ authenticate: true, user: data.user, role: data.role });
      } else {
        setAuthState({ authenticate: false, user: null, role: null });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setAuthState({ authenticate: false, user: null, role: null });
    }
  }

  async function handleLoginUser(event) {
    event.preventDefault();
    testUserCollectionAccess();
    const response = await loginService(signInFormData);
    if (response.success) {
      setAuthState({
        authenticate: true,
        user: response.data.user,
        role: response.data.role,
      });
    } else {
      setAuthState({ authenticate: false, user: null, role: null });
    }
  }

  function resetCredentials() {
    setAuthState({ authenticate: false, user: null, role: null });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("hey hi")
      if (user) {
        const authData = await checkAuthService();
        if (authData.success) {
          setAuthState({
            authenticate: true,
            user: authData.data.user,
            role: authData.data.role,
          });
        } else {
          setAuthState({ authenticate: false, user: null, role: null });
        }
      } else {
        setAuthState({ authenticate: false, user: null, role: null });
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
        resetCredentials,
        authState,
      }}
    >
      {loading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
}
