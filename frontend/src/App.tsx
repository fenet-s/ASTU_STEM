import React, { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { StatsCard } from "./components/StatsCard";
import { TicketTable } from "./components/TicketTable";
import { AIChatWidget } from "./components/AIChatWidget";
import { AuthPage } from "./components/AuthPage";
import { SubmitTicketModal } from "./components/SubmitTicketModal";
import { Ticket, User } from "./types";
import { ticketService } from "./services/api";
import {
  Ticket as TicketIcon,
  CheckCircle2,
  Clock,
  Bell,
  Search,
  Loader2,
} from "lucide-react";

import { AnalyticsDashboard } from "./components/AnalyticsDashboard";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchTickets();
      // Default view for staff is analytics as per the screenshot
      if (user.role !== "Student") {
        setCurrentView("analytics");
      }
    }
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return;
    try {
      const data =
        user.role === "Student"
          ? await ticketService.getMyTickets()
          : await ticketService.getAllTickets();
      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const handleLogin = (userData: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTickets([]);
    setCurrentView("dashboard");
  };

  const handleUpdateStatus = async (
    id: string,
    status: string,
    remarks: string,
  ) => {
    try {
      await ticketService.updateTicket(id, { status, remarks });
      fetchTickets();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const filteredTickets = searchQuery.trim()
    ? tickets.filter((t) => {
      const q = searchQuery.toLowerCase();
      const studentName =
        typeof t.student === "object" ? t.student.name.toLowerCase() : "";
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q) ||
        studentName.includes(q)
      );
    })
    : tickets;

  const resolvedCount = filteredTickets.filter((t) => t.status === "Resolved").length;
  const pendingCount = filteredTickets.filter(
    (t) => t.status === "Open" || t.status === "In Progress",
  ).length;

  const renderContent = () => {
    switch (currentView) {
      case "analytics":
        return <AnalyticsDashboard />;
      case "my-tickets":
        return (
          <div className="space-y-8">
            <section>
              <h1 className="text-3xl font-bold text-slate-800">My Tickets</h1>
              <p className="text-slate-500 mt-2">
                Track all your submitted complaints and their current status.
              </p>
            </section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                icon={TicketIcon}
                label="Total Tickets"
                value={filteredTickets.length}
                color="blue"
              />
              <StatsCard
                icon={CheckCircle2}
                label="Resolved"
                value={resolvedCount}
                color="emerald"
              />
              <StatsCard
                icon={Clock}
                label="Pending"
                value={pendingCount}
                color="amber"
              />
            </div>
            <TicketTable
              tickets={filteredTickets}
              user={user}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>
        );
      case "ticket-management":
      case "dashboard":
      default:
        return (
          <div className="space-y-8">
            <section>
              <h1 className="text-3xl font-bold text-slate-800">
                Welcome back, {user.name.split(" ")[0]}!
              </h1>
              <p className="text-slate-500 mt-2">
                {user.role === "Student"
                  ? "Here is an overview of your recent complaints and requests."
                  : "Manage student complaints and update their status."}
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                icon={TicketIcon}
                label="Total Tickets"
                value={filteredTickets.length}
                color="blue"
              />
              <StatsCard
                icon={CheckCircle2}
                label="Resolved"
                value={resolvedCount}
                color="emerald"
              />
              <StatsCard
                icon={Clock}
                label="Pending"
                value={pendingCount}
                color="amber"
              />
            </div>

            <TicketTable
              tickets={filteredTickets}
              user={user}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        onSubmitClick={() => setIsSubmitModalOpen(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800">
            {currentView === "analytics"
              ? "Admin Analytics Dashboard"
              : currentView === "my-tickets"
                ? "My Tickets"
                : `${user.role} Dashboard`}
          </h2>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all w-64"
              />
            </div>

            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">
                  {user.name}
                </p>
                <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
                  {user.role === "Staff" ? "System Admin (ASTU)" : user.role}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                {user.role === "Staff" ? (
                  <img
                    src="https://picsum.photos/seed/admin/100/100"
                    alt="Admin"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 max-w-7xl mx-auto w-full">{renderContent()}</div>
      </main>

      <SubmitTicketModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={fetchTickets}
      />

      <AIChatWidget tickets={tickets} userName={user.name.split(" ")[0]} />
    </div>
  );
}
