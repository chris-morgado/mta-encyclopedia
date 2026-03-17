import { createContext, useContext, useState, useEffect, type ReactNode, useRef } from 'react';
import {
  CognitoUser, CognitoUserSession, AuthenticationDetails,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js';
import { userPool } from '../lib/cognito';

interface AuthContextType {
  // state
  getToken: () => string | null;
  isAuthenticated: boolean;
  userEmail: string | null;

  // authentication actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  confirmSignUp: (code: string) => Promise<void>;

  // profile management actions
  updatePreferredUsername: (name: string) => Promise<void>;
  changeEmail: (newEmail: string) => Promise<void>;
  verifyEmailChange: (code: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CognitoUserSession | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const pendingUsername = useRef<string | null>(null);

  useEffect(() => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.getSession((err: Error | null, sess: CognitoUserSession) => {
        if (!err && sess.isValid()) {
          setSession(sess);
          setUserEmail(sess.getIdToken().payload.email);
        }
      });
    }
  }, []);
  // Restores session on page load

  const login = (email: string, password: string) =>
    new Promise<void>((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool });
      //                                        ^ email will be used to get UUID, emails in the future can be changed, but UUID will stay the same and be the true unique identifier for users
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
      const cognitoUsername = crypto.randomUUID(); // Now storing unique UUID in Cognito, not email
      pendingUsername.current = cognitoUsername;
      const attributes = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
        new CognitoUserAttribute({ Name: 'preferred_username', Value: username }),
      ];
      userPool.signUp(cognitoUsername, password, attributes, [], (err) => {
        if (err) reject(err); else resolve();
      });
    });

  const confirmSignUp = (code: string) =>
    new Promise<void>((resolve, reject) => {
      const user = new CognitoUser({ Username: pendingUsername.current!, Pool: userPool });
      user.confirmRegistration(code, true, (err) => {
        if (err) reject(err); else resolve();
      });
    });

  const getToken = () => session?.getIdToken().getJwtToken() ?? null;

  const updatePreferredUsername = (name: string) =>
    new Promise<void>((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();
      if (!cognitoUser) return reject(new Error('No user logged in'));
      cognitoUser.getSession((err: Error | null, sess: CognitoUserSession) => {
        if (err || !sess.isValid()) return reject(new Error('Session invalid'));
        const attribute = new CognitoUserAttribute({ Name: 'preferred_username', Value: name });
        cognitoUser.updateAttributes([attribute], (err) => {
          if (err) reject(err); else resolve();
        });
      });
    });

  const changeEmail = (newEmail: string) =>
    new Promise<void>((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();
      if (!cognitoUser) return reject(new Error('No user logged in'));
      cognitoUser.getSession((err: Error | null, sess: CognitoUserSession) => {
        if (err || !sess.isValid()) return reject(new Error('Session invalid'));
        cognitoUser.updateAttributes([new CognitoUserAttribute({ Name: 'email', Value: newEmail })], (err) => {
          if (err) reject(err); else resolve();
        });
      });
    });

  const verifyEmailChange = (code: string) =>
    new Promise<void>((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();
      if (!cognitoUser) return reject(new Error('No user logged in'));
      cognitoUser.getSession((err: Error | null, sess: CognitoUserSession) => {
        if (err || !sess.isValid()) return reject(new Error('Session invalid'));
        cognitoUser.verifyAttribute('email', code, {
          onSuccess: () => resolve(),
          onFailure: reject,
        });
      });
    });

  const changePassword = (oldPassword: string, newPassword: string) =>
    new Promise<void>((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();
      if (!cognitoUser) return reject(new Error('No user logged in'));
      cognitoUser.getSession((err: Error | null, sess: CognitoUserSession) => {
        if (err || !sess.isValid()) return reject(new Error('Session invalid'));
        cognitoUser.changePassword(oldPassword, newPassword, (err) => {
          if (err) reject(err); else resolve();
        });
      });
    });


  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!session,
      userEmail,
      getToken,
      login,
      logout,
      signUp,
      confirmSignUp,
      updatePreferredUsername,
      changeEmail,
      verifyEmailChange,
      changePassword
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
