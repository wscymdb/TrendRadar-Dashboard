import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Shield } from 'lucide-react';
import { Api, setAuthToken, getAuthToken } from '@/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') || '/';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [needAuth, setNeedAuth] = useState<boolean | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const token = getAuthToken();

    Api.getAuthStatus().then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        setNeedAuth(res.data.needAuth);
        if (token && res.data.isAuthenticated) {
          navigate(from, { replace: true });
        }
      } else {
        setNeedAuth(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [navigate, from]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading || isSuccess) return;

    if (needAuth === false) {
      setAuthToken('dev_no_auth_needed');
      setIsSuccess(true);
      setTimeout(() => navigate(from, { replace: true }), 300);
      return;
    }

    const trimmed = password.trim();
    if (!trimmed) {
      setErrorMsg('请输入访问密码');
      triggerShake();
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await Api.login(trimmed);
      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
        setIsSuccess(true);
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 300);
      } else {
        setErrorMsg(res.message || '访问密码错误');
        triggerShake();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || '服务器连接失败');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-zinc-950 flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      {/* 1. 高级深空极光背景光晕 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-amber-500/10 via-indigo-500/10 to-emerald-500/5 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[500px] h-[300px] bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* 2. 微米级科技点阵网格 */}
      <div 
        className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* 3. 核心磨砂玻璃认证卡片 */}
      <div
        className={`relative z-10 w-full max-w-[380px] rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-transform duration-200 ${
          shake ? 'animate-[shake_0.5s_ease-in-out]' : ''
        }`}
      >
        {/* 卡片顶端微妙流光细线 */}
        <div className="absolute -top-[1px] inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

        {/* 动态发光雷达与品牌标题 */}
        <div className="flex flex-col items-center text-center mb-7">
          {/* 雷达扫描容器 */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-inner mb-4 group overflow-hidden">
            {/* 脉冲环 */}
            <div className="absolute inset-2 rounded-xl border border-amber-500/20 animate-ping opacity-60" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-500/10 to-transparent" />
            
            {/* 雷达扫描动画扫面 */}
            <div className="absolute inset-0 rounded-full origin-center animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(245,158,11,0.3)_360deg)] pointer-events-none" />
            
            {/* 中心安全图标 */}
            <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700/80 shadow-sm">
              <Shield className="h-4 w-4 text-amber-400" />
            </div>
          </div>

          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            TrendRadar
          </h1>
          <p className="mt-1 text-[11px] font-medium text-zinc-400 font-mono tracking-wide">
            全网热点雷达 · 安全中枢
          </p>
        </div>

        {/* 错误提示条 */}
        {errorMsg && (
          <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 px-3 text-xs text-rose-300 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 表单区域 */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-400 transition-colors pointer-events-none">
              <Lock className="h-4 w-4" />
            </div>

            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder={needAuth === false ? '免密模式，直接进入' : '输入访问密码...'}
              disabled={loading || isSuccess || needAuth === false}
              autoFocus
              className="h-11 w-full bg-zinc-950/70 border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 rounded-xl focus-visible:border-amber-500/60 focus-visible:ring-2 focus-visible:ring-amber-500/20 pl-10 pr-10 transition-all font-mono tracking-wide"
            />

            {needAuth !== false && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || isSuccess}
            className={`w-full h-11 rounded-xl text-xs font-semibold gap-2 transition-all duration-200 shadow-md ${
              isSuccess
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/20 active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSuccess ? (
              <span>验证通过 · 进入中...</span>
            ) : (
              <>
                <span>{needAuth === false ? '直接进入系统' : '解锁进入'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>

        {/* 底部微小状态点 */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>全站访问认证保护已开启</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
