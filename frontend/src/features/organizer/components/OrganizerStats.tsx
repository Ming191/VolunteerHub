import { AlertCircle, FileCheck, Calendar } from "lucide-react";
import { StatsCard } from "@/components/common/StatsCard";
import { motion } from "framer-motion";

export interface OrganizerStatsData {
  pendingRegistrations: number;
  eventsPendingAdminApproval: number;
  totalEvents: number;
}

interface OrganizerStatsProps {
  stats: {
    pendingRegistrations: number;
    eventsPendingAdminApproval: number;
    totalEvents: number;
  };
}

export const OrganizerStats = ({ stats }: OrganizerStatsProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <StatsCard
          title="Pending Registrations"
          value={stats.pendingRegistrations}
          description="Awaiting your approval"
          icon={AlertCircle}
          variant="orange"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <StatsCard
          title="Events Pending"
          value={stats.eventsPendingAdminApproval}
          description="Awaiting admin review"
          icon={FileCheck}
          variant="blue"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <StatsCard
          title="Total Events"
          value={stats.totalEvents}
          description="Active events"
          icon={Calendar}
          variant="default"
        />
      </motion.div>
    </motion.div>
  );
};
