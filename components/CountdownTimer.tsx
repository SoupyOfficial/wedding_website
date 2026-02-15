"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string;
  postWeddingMessage?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({
  targetDate,
  postWeddingMessage = "We did it! 🎉",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    function calculateTimeLeft() {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsPast(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        ),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    }

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (isPast) {
    return (
      <div className="text-center">
        <p className="text-gold font-serif text-3xl md:text-4xl animate-fade-in">
          {postWeddingMessage}
        </p>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="flex justify-center space-x-4 md:space-x-8">
        {["Days", "Hours", "Minutes", "Seconds"].map((label) => (
          <div key={label} className="text-center">
            <div className="bg-midnight-300/50 border border-gold/20 rounded-lg p-3 md:p-4 min-w-[70px] md:min-w-[90px]">
              <span className="text-gold text-2xl md:text-4xl font-serif">
                --
              </span>
            </div>
            <span className="text-ivory/60 text-xs md:text-sm mt-2 block">
              {label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex justify-center space-x-4 md:space-x-8">
      {units.map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="bg-midnight-300/50 border border-gold/20 rounded-lg p-3 md:p-4 min-w-[70px] md:min-w-[90px] backdrop-blur-sm">
            <span className="text-gold text-2xl md:text-4xl font-serif font-bold">
              {String(unit.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-ivory/60 text-xs md:text-sm mt-2 block">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
