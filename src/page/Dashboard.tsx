import React from "react";
import { useGetUsers } from "../graphql/hooks/user";

const Dashboard = () => {
  //for testing purpose only
  const { users, error, loading, refetch } = useGetUsers();
  console.log(users);
  return <div>Dashboard</div>;
};

export default Dashboard;
