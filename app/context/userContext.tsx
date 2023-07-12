import { createContext } from "react";
import useFetchUser from "~/hooks/useFetchUser";
import { User } from "~/models/user.server";

export const UserContext = createContext<User | undefined>(undefined);

export const UserProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const { user } = useFetchUser();
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
