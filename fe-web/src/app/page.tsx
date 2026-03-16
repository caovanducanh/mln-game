'use client';

export default function LoginPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="glass-card p-10 max-w-lg w-full mx-4 text-center relative z-10">
        {/* Logo / Title */}
        <div className="mb-8">
          <div className="text-6xl mb-4">🏭</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
            EconGame
          </h1>
          <p className="text-gray-400 mt-3 text-lg">
            Trò Chơi Kinh Tế Lớp Học
          </p>
        </div>

        {/* Description */}
        <div className="mb-8 space-y-3">
          <div className="glass-card p-4 text-left">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🏢</span>
              <span className="font-semibold text-green-400">Tạo công ty</span>
            </div>
            <p className="text-sm text-gray-400">Quản lý ngân sách, tuyển nhân viên, sản xuất hàng hóa</p>
          </div>
          <div className="glass-card p-4 text-left">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">👷</span>
              <span className="font-semibold text-blue-400">Làm nhân viên</span>
            </div>
            <p className="text-sm text-gray-400">Chọn công ty, nhận lương, đình công nếu lương thấp</p>
          </div>
          <div className="glass-card p-4 text-left">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⚔️</span>
              <span className="font-semibold text-amber-400">Cạnh tranh</span>
            </div>
            <p className="text-sm text-gray-400">Phá hoại đối thủ, thâu tóm công ty, leo bảng xếp hạng</p>
          </div>
        </div>

        {/* Login Button */}
        <a
          href={`${API_URL}/oauth2/authorization/google`}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white text-lg transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            boxShadow: '0 8px 30px rgba(34, 197, 94, 0.4)',
          }}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Đăng nhập bằng Google
        </a>

        <p className="text-gray-500 text-sm mt-6">
          ~35 người chơi • Cạnh tranh kinh tế • Thời gian thực
        </p>
      </div>
    </div>
  );
}
