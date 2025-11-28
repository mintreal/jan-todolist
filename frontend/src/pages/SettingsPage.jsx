import { useNavigate } from 'react-router-dom';
import useTheme from '../hooks/useTheme';

function SettingsPage() {
  const navigate = useNavigate();
  const { currentTheme, changeTheme, availableThemes } = useTheme();

  const handleThemeChange = (themeKey) => {
    changeTheme(themeKey);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">환경설정</h1>
            <button
              onClick={() => navigate('/todos')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← 돌아가기
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            테마 색상
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            앱의 주요 색상을 변경할 수 있습니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(availableThemes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key)}
                className={`relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                  currentTheme === key
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full flex-shrink-0"
                  style={{ backgroundColor: theme.primary }}
                />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">{theme.name}</p>
                  <p className="text-sm text-gray-500">{theme.primary}</p>
                </div>
                {currentTheme === key && (
                  <div className="absolute top-2 right-2">
                    <svg
                      className="w-5 h-5 text-gray-900"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">미리보기</h3>
            <div className="space-y-2">
              <button
                className="w-full py-2 px-4 rounded-md text-white font-medium transition-colors"
                style={{
                  backgroundColor: availableThemes[currentTheme].primary,
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor =
                    availableThemes[currentTheme].primaryHover;
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor =
                    availableThemes[currentTheme].primary;
                }}
              >
                기본 버튼
              </button>
              <div
                className="p-3 rounded-md"
                style={{
                  backgroundColor: availableThemes[currentTheme].primaryLight,
                  color: availableThemes[currentTheme].primary,
                }}
              >
                <p className="text-sm font-medium">밝은 배경 영역</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SettingsPage;
