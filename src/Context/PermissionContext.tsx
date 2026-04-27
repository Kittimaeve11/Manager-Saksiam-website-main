import { createContext, useContext } from "react";

interface PermissionContextProps {
  permissions: string[];
  can: (perm: string) => boolean;
}

const PermissionContext = createContext<PermissionContextProps>({
  permissions: [],
  can: () => false,
});

export const PermissionProvider = ({
  permissions,
  children,
}: {
  permissions: string[];
  children: React.ReactNode;
}) => {
  const can = (perm: string) => permissions.includes(perm);

  return (
    <PermissionContext.Provider value={{ permissions, can }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const useCan = () => useContext(PermissionContext);