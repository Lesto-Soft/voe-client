import React from "react";
import { useGetAnalyticsDataCases } from "../graphql/hooks/case";

const Analyses = () => {
  const {
    loading: analyticsDataLoading,
    error: analyticsDataError,
    cases: analyticsDataCases,
  } = useGetAnalyticsDataCases();

  /*
  REFERENCE FOR THE OBJECT IN THE analyticsDataCases ARRAY:
  const caseFragment = `
  fragment CaseFragment on Case {
      _id
    case_number
    creator {
      _id
      name
      position
      username
    }
    priority
    type
    categories {
        _id
        name     
    }
    content
    status  
    date
  }`;
  */

  console.log("Analytics Data Cases:", analyticsDataCases);
  if (analyticsDataLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Зареждане на аналитични данни...</p>
      </div>
    );
  }

  if (analyticsDataError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>
          Грешка при зареждане на аналитични данни: {analyticsDataError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-row flex-wrap items-center justify-center">
      <p>Аналитични данни:</p>
      {analyticsDataCases.map((caseItem: any) => (
        <div key={caseItem._id} className="p-4 border rounded mb-2">
          <h3 className="font-bold">Case Number: {caseItem.case_number}</h3>
          <p>Creator: {caseItem.creator.name}</p>
          <p>Priority: {caseItem.priority}</p>
          <p>Type: {caseItem.type}</p>
          <p>Status: {caseItem.status}</p>
          <p>Date: {new Date(caseItem.date).toLocaleDateString()}</p>
          <div>
            Categories:
            <ul>
              {caseItem.categories.map((category: any) => (
                <li key={category._id}>{category.name}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Analyses;
