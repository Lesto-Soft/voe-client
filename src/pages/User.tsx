import React from "react";
import { useParams } from "react-router"; // Assuming you use react-router-dom
import { useGetUserById } from "../graphql/hooks/user";

const User = () => {
  const { id: userIdFromParams } = useParams<{ id: string }>();

  const {
    loading: userLoading,
    error: userError,
    user,
  } = useGetUserById(userIdFromParams);

  console.log(
    "[HOOK] Attempting to fetch user with input id:",
    userIdFromParams
  );
  console.log("[HOOK] User data:", user);
  console.log("[HOOK] User loading:", userLoading);
  console.log("[HOOK] User error:", userError);

  if (userIdFromParams === undefined) {
    return <div>User ID not found in URL.</div>;
  }

  if (userLoading) return <p>Loading user data...</p>;
  if (userError) return <p>Error loading user data: {userError.message}</p>;
  if (!user) return <p>No user found with ID: {userIdFromParams}</p>;

  return (
    <div>
      <h1>User Details</h1>
      <p>
        Displaying data for User ID: <strong>{userIdFromParams}</strong>
      </p>

      {/* Basic User Info */}
      <h2>Basic Information</h2>
      <p>
        <strong>ID:</strong> {user._id}
      </p>
      <p>
        <strong>Name:</strong> {user.name}
      </p>
      <p>
        <strong>Username:</strong> {user.username}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Position:</strong> {user.position || "N/A"}
      </p>
      <p>
        <strong>Role:</strong> {user.role?.name || "N/A"}
      </p>
      <p>
        <strong>Financial Approver:</strong>{" "}
        {user.financial_approver ? "Yes" : "No"}
      </p>

      {/* Avatar */}
      {user.avatar && ( // Assuming avatar is a URL string or null
        <div>
          <h2>Avatar</h2>
          {/* If user.avatar is an object with a URL property, adjust accordingly.
            For example: <img src={user.avatar.url} alt={`${user.name}'s avatar`} width="100" />
          */}
          <img
            src={String(user.avatar)}
            alt={`${user.name}'s avatar`}
            width="100"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          {/* Added onError to hide if the image fails to load or if avatar is not a direct URL */}
        </div>
      )}

      {/* Expert Categories */}
      {user.expert_categories && user.expert_categories.length > 0 && (
        <div>
          <h2>Expert In Categories</h2>
          <ul>
            {user.expert_categories.map((category) => (
              <li key={category._id}>{category.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Managed Categories */}
      {user.managed_categories && user.managed_categories.length > 0 && (
        <div>
          <h2>Manages Categories</h2>
          <ul>
            {user.managed_categories.map((category) => (
              <li key={category._id}>{category.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cases */}
      {user.cases && user.cases.length > 0 && (
        <div>
          <h2>Cases ({user.cases.length})</h2>
          {/* You might want to display only a few or link to a separate cases page */}
          <ul>
            {user.cases.slice(0, 5).map(
              (
                caseItem // Displaying first 5 cases as an example
              ) => (
                <li key={caseItem._id}>
                  <strong>ID:</strong> {caseItem._id} <br />
                  <strong>Type:</strong> {caseItem.type} <br />
                  <strong>Status:</strong> {caseItem.status} <br />
                  <strong>Content:</strong> {caseItem.content.substring(0, 100)}
                  ... <br />
                  <strong>Date:</strong> {caseItem.date}
                </li>
              )
            )}
            {user.cases.length > 5 && (
              <li>And {user.cases.length - 5} more...</li>
            )}
          </ul>
        </div>
      )}

      {/* Answers */}
      {user.answers && user.answers.length > 0 && (
        <div>
          <h2>Answers ({user.answers.length})</h2>
          <ul>
            {user.answers.slice(0, 5).map(
              (
                answer // Displaying first 5 answers
              ) => (
                <li key={answer._id}>
                  <strong>ID:</strong> {answer._id} <br />
                  <strong>Content:</strong> {answer.content?.substring(0, 100)}
                  ... <br />
                  <strong>Date:</strong> {answer.date} <br />
                  <strong>Approved:</strong>{" "}
                  {answer.approved
                    ? `Yes (ID: ${answer.approved._id})`
                    : "No/Pending"}
                </li>
              )
            )}
            {user.answers.length > 5 && (
              <li>And {user.answers.length - 5} more...</li>
            )}
          </ul>
        </div>
      )}

      {/* Comments */}
      {user.comments && user.comments.length > 0 && (
        <div>
          <h2>Comments ({user.comments.length})</h2>
          <ul>
            {user.comments.slice(0, 5).map(
              (
                comment // Displaying first 5 comments
              ) => (
                <li key={comment._id}>
                  <strong>ID:</strong> {comment._id} <br />
                  <strong>Content:</strong> {comment.content?.substring(0, 100)}
                  ... <br />
                  <strong>Date:</strong> {comment.date}
                </li>
              )
            )}
            {user.comments.length > 5 && (
              <li>And {user.comments.length - 5} more...</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default User;
