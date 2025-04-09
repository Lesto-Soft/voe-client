import { useState } from "react";
import { Link } from "react-router";

const CaseForm = ({
  setIsLogin,
}: {
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="text-center lg:text-left lg:w-full flex-1 space-y-6">
      <div className="">
        <h1 className="lg:text-5xl text-4xl font-extrabold font-main text-gray-800 uppercase w-80 text-center lg:text-left drop-shadow-lg">
          Гласът на
          <br /> служителите
        </h1>
        <p className="italic text-lg my-3 text-gray-600 w-80 text-center lg:text-left">
          Подай сигнал
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <Link to={`/submit-case?type=problem`}>
            <button className="bg-btnRed hover:bg-red-200 text-white rounded-lg lg:w-88 w-72 py-3 px-5 uppercase font-bold shadow-xl lg:text-2xl transition-all duration-300">
              Проблем
            </button>
          </Link>
        </div>
        <div>
          <Link to="/submit-case?type=suggestion">
            <button className="bg-btnGreen hover:bg-green-200 text-white rounded-lg lg:w-88 w-72 py-3 px-5  uppercase font-bold shadow-xl lg:text-2xl transition-all duration-300">
              Подобрение
            </button>
          </Link>
        </div>
      </div>
      <div className="mt-6 w-80 text-center">
        <button
          className="text-blue-600 hover:text-blue-700 underline font-medium transition-all duration-300"
          onClick={() => setIsLogin(true)}
        >
          Влез в профила си
        </button>
      </div>
    </div>
  );
};

const LoginForm = ({
  setIsLogin,
}: {
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="text-center lg:text-left lg:w-full flex-1 space-y-6">
      <div className="">
        <h1 className="lg:text-5xl text-4xl font-extrabold font-main text-gray-800 uppercase w-80 text-center lg:text-left drop-shadow-lg">
          Гласът на
          <br /> служителите
        </h1>
        <p className="italic text-lg my-3 text-gray-600 w-80 text-center lg:text-left">
          Въведете потребител и парола
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Потребител"
            className="lg:w-88 py-3 px-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Парола"
            className="lg:w-88  py-3 px-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="mt-6 w-80 text-center">
        <button
          onClick={() => setIsLogin(false)}
          className="text-blue-600 hover:text-blue-700 underline font-medium transition-all duration-300"
        >
          Подай сигнал
        </button>
      </div>
    </div>
  );
};

const Home = () => {
  const [isLogin, setIsLogin] = useState(false);
  return (
    <div className="container mx-auto h-screen flex items-center ">
      <div className="flex flex-col-reverse lg:flex-row justify-around items-center w-full p-6 lg:p-12">
        {isLogin ? (
          <LoginForm setIsLogin={setIsLogin} />
        ) : (
          <CaseForm setIsLogin={setIsLogin} />
        )}
        <div className="lg:w-1/2 flex-1 flex justify-center items-center">
          <img
            src="/images/illustrations/voe2-bg.png"
            alt="VOE Image"
            className="h-60 w-60 lg:h-full lg:w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
