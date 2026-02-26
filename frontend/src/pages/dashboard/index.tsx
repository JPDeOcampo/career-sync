import React from "react";
import { useAppSelector } from "@/hooks/useRedux";
import { selectAuth } from "@/store/selectors";

const Dashboard = () => {
  const auth = useAppSelector(selectAuth);
  console.log(auth);
  return <div>Dashboard</div>;
};

export default Dashboard;
