import { Calendar, Clock, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/common/StatsCard";
import { motion } from "framer-motion";

interface VolunteerStatsProps {
  stats: {
    upcomingCount: number;
    pendingCount: number;
    newCount: number;
  };
}

export const VolunteerStats = ({ stats }: VolunteerStatsProps) => {
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
          title="Upcoming Events"
          value={stats.upcomingCount}
          description="Events you're registered for"
          icon={Calendar}
          variant="volunteer"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <StatsCard
          title="Pending Approvals"
          value={stats.pendingCount}
          description="Awaiting organizer approval"
          icon={Clock}
          variant="orange"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <StatsCard
          title="New Opportunities"
          value={stats.newCount}
          description="Recently published events"
          icon={TrendingUp}
          variant="purple"
        />
      </motion.div>
    </motion.div>
  );
};
