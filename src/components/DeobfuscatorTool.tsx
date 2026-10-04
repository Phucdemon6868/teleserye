import React, { useState } from 'react';
import { Sparkles, Code2, Play, Copy, Check, FileVideo, ExternalLink, RefreshCw } from 'lucide-react';
import { extractPackedScript, deobfuscatePackedJs } from '../utils/deobfuscator';

export const DeobfuscatorTool: React.FC = () => {
  const samplePacked = `eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c]);return p}('var 2=[{"0":"1://4-3.5.6/7/8_9.a","b":"c"}];',13,13,'file|https|directSources|stream|edge|teleserye|su|hls|part1|1080p|mp4|label|1080p'.split('|'),0,{}))`;

  const [inputScript, setInputScript] = useState(samplePacked);
  const [decodedOutput, setDecodedOutput] = useState('');
  const [extractedSources, setExtractedSources] = useState<Array<{ file: string; label?: string }>>([]);
  const [params, setParams] = useState<{ a?: number; c?: number; wordsCount?: number }>({});
  const [copied, setCopied] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const handleDeobfuscate = () => {
    setHasRun(true);
    const result = extractPackedScript(inputScript);
    if (result && result.decoded) {
      setDecodedOutput(result.decoded);
      setExtractedSources(result.extractedSources || []);
      setParams({
        a: result.a,
        c: result.c,
        wordsCount: result.k.length,
      });
    } else {
      // Try raw unpacked fallback if user only pasted the inner return p}(...)
      try {
        const pattern = /return\s+p\s*}\s*\(\s*'((?:\\.|[^'\\])*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'((?:\\.|[^'\\])*)'\s*\.split\(\s*'\|'\s*\)/s;
        const m = inputScript.match(pattern);
        if (m) {
          const p = m[1];
          const a = parseInt(m[2], 10);
          const c = parseInt(m[3], 10);
          const k = m[4].split('|');
          const decoded = deobfuscatePackedJs(p, a, c, k);
          setDecodedOutput(decoded);
          setParams({ a, c, wordsCount: k.length });
        } else {
          setDecodedOutput('⚠️ Không tìm thấy cấu trúc mã hóa P.A.C.K.E.R chuẩn (eval(function(p,a,c,k,e,d)...)). Vui lòng kiểm tra lại nội dung script.');
          setExtractedSources([]);
        }
      } catch (err: any) {
        setDecodedOutput(`Lỗi giải mã: ${err.message}`);
        setExtractedSources([]);
      }
    }
  };

  const handleCopyDecoded = () => {
    navigator.clipboard.writeText(decodedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-100">
              Công cụ kiểm thử & giải mã JavaScript P.A.C.K.E.R
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-3xl leading-relaxed">
              Các website phim Teleserye thường mã hóa thẻ nguồn video player bằng thuật toán Dean Edwards Packer (<code className="text-neutral-300 font-mono">eval(function(p,a,c,k,e,d)...)</code>). Công cụ này thực thi bộ giải mã nguyên bản tương thích 100% với hàm Python <code className="text-blue-400 font-mono">_deobfuscate_packed_js</code> để tách nguồn trực tiếp <code className="text-neutral-300 font-mono">directSources</code> và <code className="text-neutral-300 font-mono">proxySources</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Editor & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Input Script */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800 text-xs">
            <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Mã JavaScript bị làm mờ (Packed Script)</span>
            </span>
            <button
              onClick={() => {
                setInputScript(samplePacked);
                setHasRun(false);
              }}
              className="text-neutral-400 hover:text-neutral-200 text-[11px] flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Nạp lại mẫu test</span>
            </button>
          </div>

          <textarea
            value={inputScript}
            onChange={(e) => setInputScript(e.target.value)}
            placeholder="Dán đoạn script eval(function(p,a,c,k,e,d)...) vào đây..."
            className="flex-1 w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-200 font-mono resize-none focus:outline-none focus:border-blue-500"
          />

          <div className="pt-3 mt-2 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-mono">
              Độ dài ký tự: {inputScript.length.toLocaleString()}
            </span>
            <button
              onClick={handleDeobfuscate}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Giải mã & Tìm link video</span>
            </button>
          </div>
        </div>

        {/* Right: Decoded Output & Extracted Sources */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800 text-xs">
            <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <FileVideo className="w-4 h-4 text-emerald-400" />
              <span>Kết quả giải mã & Nguồn video</span>
            </span>
            {decodedOutput && (
              <button
                onClick={handleCopyDecoded}
                className="text-neutral-400 hover:text-neutral-200 text-[11px] flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Sao chép code</span>
              </button>
            )}
          </div>

          {/* Extracted Sources Callout */}
          {extractedSources.length > 0 && (
            <div className="mb-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs space-y-1.5">
              <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Tìm thấy {extractedSources.length} luồng video trực tiếp:</span>
              </p>
              {extractedSources.map((source, idx) => (
                <div key={idx} className="flex items-center justify-between font-mono text-[11px] text-neutral-300 bg-neutral-950/80 p-2 rounded border border-neutral-800">
                  <span className="truncate max-w-[320px] text-emerald-400">{source.file}</span>
                  <a
                    href={source.file}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[10px]"
                  >
                    <span>Mở stream</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Parameters info */}
          {params.a && (
            <div className="mb-2 flex items-center gap-3 text-[11px] font-mono text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded border border-neutral-800">
              <span>Cơ số Base (a): {params.a}</span>
              <span>·</span>
              <span>Tổng biến Count (c): {params.c}</span>
              <span>·</span>
              <span>Số từ khóa (words): {params.wordsCount}</span>
            </div>
          )}

          {/* Decoded script box */}
          <div className="flex-1 overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-lg p-3 font-mono text-xs text-neutral-300 whitespace-pre-wrap select-text">
            {decodedOutput || (
              <span className="text-neutral-600 italic">
                Nhấn &quot;Giải mã & Tìm link video&quot; để chạy thuật toán...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
