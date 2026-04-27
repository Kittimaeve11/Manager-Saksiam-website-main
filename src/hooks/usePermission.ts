import { useAuth } from "../Context/AuthContext";

export const usePermission = () => {
  const { permissions, loading } = useAuth();

  const can = (slug: string) => {
    return permissions.includes(slug);
  };

  return { can, permissions, loading };
};