const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/\{txStep === "error" && txError && \([\s\S]*?\{txError\}[\s\S]*?\<\/div\>[\s\S]*?\)\}/g, `{txStep === "error" && txError && (
  <div className="flex items-start justify-between border-t border-red-500/10 pt-1.5 mt-1">
    <div className="text-red-400 font-sans text-[11px] leading-relaxed pr-4">
      ⚠️ <strong>Execution Failed:</strong> {txError}
    </div>
    <button onClick={() => setTxStep("idle")} type="button" className="text-[10px] bg-red-500/10 text-red-400 px-2.5 py-1 rounded-md hover:bg-red-500/20 active:scale-95 transition-all shrink-0">
      Dismiss Error
    </button>
  </div>
)}`);
fs.writeFileSync('src/App.tsx', content);
