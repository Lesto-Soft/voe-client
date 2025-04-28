import { useGetUsers } from "../graphql/hooks/user";

const Users = () => {
  const { users, loading, error, refetch } = useGetUsers({});

  if (loading) return <p>Loading...</p>;
  if (error)
    return (
      <div>
        ERROR!:
        <button
          onClick={() => {
            console.log("refetching...");
            refetch();
          }}
          className="text-black"
        >
          Reload
        </button>
      </div>
    );

  console.log(users, loading, error);
  return <div>{users.getAllUsers.map((el: any) => `${el.name}\n`)}</div>;
};

export default Users;
