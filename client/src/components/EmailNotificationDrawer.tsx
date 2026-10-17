import { useState, useEffect } from "react";
import { housePlanningService, type TransactionalEmailLog } from "../services/housePlanningService";

interface EmailNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: "customer" | "professional" | "admin";
}

export default function EmailNotificationDrawer({
  isOpen,
  onClose,
  activeRole,
}: EmailNotificationDrawerProps) {
  const [emails, setEmails] = useState<TransactionalEmailLog[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<TransactionalEmailLog | null>(null);

  useEffect(() => {
    if (isOpen) {
      const logs = housePlanningService.getEmailLogs();
      setEmails(logs);
      if (logs.length > 0 && !selectedEmail) {
        setSelectedEmail(logs[0]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (email: TransactionalEmailLog) => {
    housePlanningService.markEmailRead(email.id);
    setSelectedEmail(email);
    setEmails(housePlanningService.getEmailLogs());
  };

  return (
    <div className="fixed inset-0 z-[10001] bg-black/70 backdrop-blur-xs flex justify-end animate-fadeIn select-none">
      <div className="w-full max-w-3xl h-full bg-[#FAF8F5] border-l border-[rgba(28,24,20,0.15)] shadow-2xl flex flex-col overflow-hidden animate-slideInRight">
        {/* Top Header */}
        <div className="p-4 bg-[#181614] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#B88555] flex items-center justify-center font-bold text-sm">
              ✉
            </span>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Live Transactional Email &amp; Notification Simulator
              </h3>
              <p className="text-[11px] text-white/60">
                Viewing dispatched platform communications (Role: {activeRole.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Email List Column */}
          <div className="w-full md:w-5/12 border-r border-[rgba(28,24,20,0.08)] bg-white/70 overflow-y-auto p-3 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(28,24,20,0.06)] px-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#8E867B]">
                Inbox ({emails.length})
              </span>
              <button
                onClick={() => setEmails(housePlanningService.getEmailLogs())}
                className="text-[10px] text-[#B88555] font-semibold hover:underline"
              >
                ↻ Refresh
              </button>
            </div>

            {emails.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8E867B]">
                No dispatched notifications yet. Submitting a consultation or confirming a slot generates live logs here.
              </div>
            ) : (
              emails.map((e) => {
                const isSelected = selectedEmail?.id === e.id;
                return (
                  <div
                    key={e.id}
                    onClick={() => handleSelect(e)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#FAF8F5] border-[#B88555] shadow-xs"
                        : "bg-white border-[rgba(28,24,20,0.08)] hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#EFECE6] text-[#575149]">
                        {e.category.replace("_", " ")}
                      </span>
                      <span className="text-[9px] text-[#8E867B] font-mono">
                        {new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-[#181614] truncate">{e.subject}</h5>
                    <p className="text-[11px] text-[#575149] truncate mt-0.5">To: {e.recipientName} ({e.to})</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Email Preview Column */}
          <div className="flex-1 bg-[#FAF8F5] p-5 overflow-y-auto">
            {selectedEmail ? (
              <div className="space-y-4">
                {/* Meta details */}
                <div className="p-4 bg-white rounded-2xl border border-[rgba(28,24,20,0.08)] shadow-2xs space-y-2 text-xs">
                  <div>
                    <span className="text-[#8E867B] block text-[10px] uppercase font-mono">Subject</span>
                    <strong className="text-sm text-[#181614]">{selectedEmail.subject}</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[rgba(28,24,20,0.06)] text-[11px]">
                    <span className="text-[#8E867B]">Recipient: <strong>{selectedEmail.recipientName}</strong> &lt;{selectedEmail.to}&gt;</span>
                    <span className="font-mono text-[#8E867B]">{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* Rendered HTML */}
                <div className="p-6 bg-white rounded-2xl border border-[rgba(28,24,20,0.08)] shadow-sm">
                  <div
                    className="prose prose-sm max-w-none text-xs text-[#181614]"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#8E867B]">
                Select an email from the left to view the transactional payload
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
