import React from "react";
import { useParams } from "react-router";

const UserData = () => {
  // Let useParams infer its return type
  const params = useParams();

  // Access userId, it will be typed as string | undefined
  const userId = params.userId;

  // Explicitly check if userId exists (recommended)
  if (userId === undefined) {
    // Or simply !userId, but checking undefined is more explicit
    return <div>User ID not found in URL.</div>;
  }

  // If you reach here, TypeScript knows userId is a string
  // You can now use userId safely

  return (
    <div>
      <h1>User Data</h1>
      <p>
        Displaying data for User ID: <strong>{userId}</strong>
      </p>
      {/* Fetch user data using the validated userId */}
    </div>
  );
};

export default UserData;
