
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
  const circumference = 2 * Math.PI * 22;
  const strokeDashoffset = circumference - (mastery / 100) * circumference;

  return (
    <div className="py-4 border-t border-border/40 transition-colors duration-200 hover:bg-muted/10 -mx-4 px-4 rounded-xl">
      <div className="flex items-center gap-5">
        
        {/* Circular Progress */}
        <div className="relative w-12 h-12 shrink-0">
          <svg className="w-12 h-12 transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="24"
              cy="24"
              r="22"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-secondary/50"
            />
            {/* Progress Track */}
            <circle
              cx="24"
              cy="24"
              r="22"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="text-primary transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-foreground p-3">
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground tracking-tight truncate">{subject}</h3>
          <p className="text-xs text-muted-foreground mb-1.5 opacity-80">
            {completedTopics} of {topics} topics active
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-light text-foreground">
              {mastery}%
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              mastery
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SubjectMasteryCard;