import { useEffect } from "react";
import { useSession } from "../hooks/AuthContext";
import { api } from "../services/api";

export default function () {
  useEffect(() => {
    api
      .get("/me")
      .then((response) => console.log(response?.data))
      .catch((err) => console.log(err));
  }, []);
  const { user } = useSession();
  return (
    <div>
      <h1>dashboard {user?.email}</h1>
    </div>
  );
}
