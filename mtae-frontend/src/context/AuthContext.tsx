import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { CognitoUser, CognitoUserSession, AuthenticationDetails,
         CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { userPool } from '../lib/cognito';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  getToken: () => string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CognitoUserSession | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.getSession((err: Error | null, sess: CognitoUserSession) => {
        if (!err && sess.isValid()) {
          setSession(sess);
          setUserEmail(cognitoUser.getUsername());
        }
      });
    }
  }, []);
    // Restores session on page load

  const login = (email: string, password: string) =>
    new Promise<void>((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool });
      user.authenticateUser(
        new AuthenticationDetails({ Username: email, Password: password }),
        {
          onSuccess: (sess) => { setSession(sess); setUserEmail(email); resolve(); },
          onFailure: reject,
        }
      );
    });

  const logout = () => {
    userPool.getCurrentUser()?.signOut();
    setSession(null);
    setUserEmail(null);
  };

  const signUp = (email: string, password: string, username: string) =>
    new Promise<void>((resolve, reject) => {
      const attributes = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
        new CognitoUserAttribute({ Name: 'preferred_username', Value: username }),
      ];
      userPool.signUp(email, password, attributes, [], (err) => {
        if (err) reject(err); else resolve();
      });
    });

  const confirmSignUp = (email: string, code: string) =>
    new Promise<void>((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool });
      user.confirmRegistration(code, true, (err) => {
        if (err) reject(err); else resolve();
      });
    });

  const getToken = () => session?.getIdToken().getJwtToken() ?? null;

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!session,
      userEmail,
      getToken,
      login,
      logout,
      signUp,
      confirmSignUp,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
