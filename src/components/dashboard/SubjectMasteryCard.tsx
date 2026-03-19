
interface SubjectMasteryCardProps {
  subject: string;
  mastery: number;
  topics: number;
  completedTopics: number;
  icon: React.ReactNode;
}

const SubjectMasteryCard = ({ 
  subject, 
  mastery, 
  topics, 
  completedTopics, 
  icon 
}: SubjectMasteryCardProps) => {
  // Calculate circle progress
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (mastery / 100) * circumference;

  return (
    <div className="p-6 rounded-2xl bg-card border border-border transition-colors duration-200 hover:border-foreground/20 hover:bg-muted/30">
      <div className="flex items-center gap-5">
        
        {/* Circular Progress */}
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
              className="text-secondary"
            />
            {/* Progress Track */}
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="text-primary transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-foreground">
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1 truncate tracking-tight">{subject}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {completedTopics} of {topics} topics completed
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-foreground">
              {mastery}%
            </span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              mastery
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SubjectMasteryCard;