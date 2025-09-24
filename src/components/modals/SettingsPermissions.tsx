import React, { useState } from "react";
import { IUser } from "../../db/interfaces";

interface SettingsPermissionsProps {
  user: IUser;
}

const SettingsPermissions: React.FC<SettingsPermissionsProps> = ({ user }) => {
  // In a real app, `user.lockedSettings` would be a prop like ['account', 'notifications']
  const [lockedSettings, setLockedSettings] = useState<string[]>(["account"]);

  const handleToggle = (settingKey: string) => {
    setLockedSettings((prev) =>
      prev.includes(settingKey)
        ? prev.filter((s) => s !== settingKey)
        : [...prev, settingKey]
    );
  };

  const settingOptions = [
    { key: "account", label: 'Редакция на "Акаунт"' },
    { key: "appearance", label: 'Редакция на "Визия"' },
    { key: "notifications", label: 'Редакция на "Известия"' },
    { key: "behavior", label: 'Редакция на "Изгледи"' },
  ];

  return (
    <div className="bg-white p-6 rounded-lg h-126 shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">
        Заключване на настройки
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Премахнете отметката, за да забраните на <strong>{user.name}</strong> да
        редактира дадена секция от своите настройки.
      </p>
      <hr className="my-4 border-gray-200" />
      <div className="space-y-3">
        {settingOptions.map((opt) => (
          <label
            key={opt.key}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-md cursor-pointer"
          >
            <input
              type="checkbox"
              checked={!lockedSettings.includes(opt.key)}
              onChange={() => handleToggle(opt.key)}
              className="cursor-pointer h-5 w-5 rounded"
            />
            <span className="font-medium text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default SettingsPermissions;
