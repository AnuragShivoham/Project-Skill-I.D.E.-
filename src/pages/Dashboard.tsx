import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      checkUserRole();
    }
  }, [user, loading, navigate]);

  const checkUserRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;

      // Check user's role and redirect accordingly
      const isAdmin = data?.some((r) => r.role === "admin");
      const isMentor = data?.some((r) => r.role === "mentor");

      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else if (isMentor) {
        navigate("/mentor", { replace: true });
      } else {
        navigate("/student", { replace: true });
      }
    } catch (error) {
      console.error("Error checking role:", error);
      // Default to student dashboard on error
      navigate("/student", { replace: true });
    } finally {
      setCheckingRole(false);
    }
  };

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return null;
};

export default Dashboard;
