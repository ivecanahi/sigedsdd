import { Navigate } from 'react-router-dom';
import { APP_FULL_NAME, APP_NAME } from '../../../config/app';
import heroImage from '../../../assets/hero.png';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-1/2 min-h-[409px] md:min-h-screen bg-primary flex-col items-center justify-center p-8 md:p-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-[#364fc7] opacity-90 z-0" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          <img
            src={heroImage}
            alt={`${APP_FULL_NAME} - Ilustración`}
            className="w-full max-w-[320px] md:max-w-[420px] mb-8 drop-shadow-2xl"
          />
          <h1 className="text-white italic font-bold text-lg md:text-2xl leading-relaxed tracking-wide opacity-90">
            {APP_FULL_NAME} ({APP_NAME})
          </h1>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 min-h-screen flex flex-col items-center justify-center p-6 md:p-12 bg-surface relative">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
        <footer className="w-full py-6 px-8 text-center md:absolute md:bottom-0">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            @ {new Date().getFullYear()} {APP_NAME}
          </p>
        </footer>
      </div>
    </div>
  );
}
