import { useState, useEffect, useRef } from "react";
import { useLazyQuery, ApolloError } from "@apollo/client";
import { GET_USER_BY_USERNAME } from "../query/user"; // Adjust path
import {
  UserQueryResult,
  UserQueryVars,
} from "../../types/CaseSubmittionTypes"; // Adjust path
import { DEBOUNCE_DELAY } from "../../constants/caseSubmittionConstants"; // Adjust path

export const useUserLookupDebounced = (usernameInput: string) => {
  const [fetchedName, setFetchedName] = useState<string>("");
  const [fetchedCreatorId, setFetchedCreatorId] = useState<string | null>(null);
  const [notFoundUsername, setNotFoundUsername] = useState<string | null>(null);
  const [searchedUsername, setSearchedUsername] = useState<string | null>(null);

  const [
    getUserByUsernameQuery,
    { loading: userLoading, error: userError, data: userData },
  ] = useLazyQuery<UserQueryResult, UserQueryVars>(GET_USER_BY_USERNAME);

  const debounceTimerRef = useRef<number | null>(null);

  // Effect for Debouncing
  useEffect(() => {
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    const trimmedUsername = usernameInput.trim();

    if (!trimmedUsername) {
      setFetchedName("");
      setFetchedCreatorId(null);
      setNotFoundUsername(null);
      setSearchedUsername(null);
      return;
    }
    // Clear "not found" message as soon as user starts typing again
    setNotFoundUsername(null);

    debounceTimerRef.current = window.setTimeout(() => {
      console.log(`Debounced: Fetching user for username: ${trimmedUsername}`);
      setSearchedUsername(trimmedUsername); // Store username being searched
      getUserByUsernameQuery({ variables: { username: trimmedUsername } });
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimerRef.current)
        window.clearTimeout(debounceTimerRef.current);
    };
  }, [usernameInput, getUserByUsernameQuery]);

  // Effect for Handling Result
  useEffect(() => {
    if (userLoading) return;
    if (userError) {
      setFetchedName("");
      setFetchedCreatorId(null);
      setNotFoundUsername(null);
      console.error("User query error:", userError);
      return;
    }
    if (typeof userData !== "undefined") {
      if (userData && userData.getLeanUserByUsername) {
        setFetchedName(userData.getLeanUserByUsername.name);
        setFetchedCreatorId(userData.getLeanUserByUsername._id);
        setNotFoundUsername(null);
      } else {
        setFetchedName("");
        setFetchedCreatorId(null);
        if (searchedUsername) setNotFoundUsername(searchedUsername);
        else setNotFoundUsername(null);
      }
    }
  }, [userData, userLoading, userError, searchedUsername]);

  // Return values needed by the component
  return {
    userLoading,
    userError: userError as ApolloError | undefined, // Cast for clarity if needed downstream
    notFoundUsername,
    fetchedName,
    fetchedCreatorId,
  };
};
