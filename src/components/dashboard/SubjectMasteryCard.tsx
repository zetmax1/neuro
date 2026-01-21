import { cn } from "@/lib/utils";

interface SubjectMasteryCardProps {
  subject: string;
  mastery: number;
  topics: number;
  completedTopics: number;
  icon: React.ReactNode;
  color: string;
}

const SubjectMasteryCard = ({ 
  subject, 
  mastery, 
  topics, 
  completedTopics, 
  icon,
  color 
}: SubjectMasteryCardProps) => {
  // Calculate circle progress
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (mastery / 100) * circumference;

  return (
    <div className="p-6 rounded-2xl bg-card border border-border card-hover">
      <div className="flex items-center gap-4">
        {/* Circular Progress */}
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke={color}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{subject}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {completedTopics} of {topics} topics completed
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color }}>
              {mastery}%
            </span>
            <span className="text-sm text-muted-foreground">mastery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectMasteryCard;
