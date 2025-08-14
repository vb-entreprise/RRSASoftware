interface TimeZoneSettings {
  timeZone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

class TimeZoneService {
  private getSettings(): TimeZoneSettings {
    const savedSettings = localStorage.getItem('hospitalSettings');
    const defaultSettings: TimeZoneSettings = {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    };

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return { ...defaultSettings, ...parsed };
      } catch (error) {
        console.error('Error parsing time zone settings:', error);
        return defaultSettings;
      }
    }

    return defaultSettings;
  }

  formatDate(date: Date | string, options?: Partial<Intl.DateTimeFormatOptions>): string {
    const settings = this.getSettings();
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    try {
      const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: settings.timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...options
      };

      return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateObj.toLocaleDateString();
    }
  }

  formatTime(date: Date | string, options?: Partial<Intl.DateTimeFormatOptions>): string {
    const settings = this.getSettings();
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Time';
    }

    try {
      const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: settings.timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: settings.timeFormat === '12h',
        ...options
      };

      return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
    } catch (error) {
      console.error('Error formatting time:', error);
      return dateObj.toLocaleTimeString();
    }
  }

  formatDateTime(date: Date | string, options?: Partial<Intl.DateTimeFormatOptions>): string {
    const settings = this.getSettings();
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return 'Invalid DateTime';
    }

    try {
      const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: settings.timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: settings.timeFormat === '12h',
        ...options
      };

      return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return dateObj.toLocaleString();
    }
  }

  formatRelative(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else {
      return this.formatDate(dateObj);
    }
  }

  getCurrentTimeZone(): string {
    return this.getSettings().timeZone;
  }

  getCurrentTime(): Date {
    return new Date();
  }

  formatForDatabase(date: Date): string {
    // Always store in ISO format for database consistency
    return date.toISOString();
  }

  parseFromDatabase(isoString: string): Date {
    return new Date(isoString);
  }

  isToday(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    const settings = this.getSettings();

    // Compare dates in the configured time zone
    const todayFormatted = this.formatDate(today, { timeZone: settings.timeZone });
    const dateFormatted = this.formatDate(dateObj, { timeZone: settings.timeZone });

    return todayFormatted === dateFormatted;
  }

  getStartOfDay(date?: Date): Date {
    const targetDate = date || new Date();
    const settings = this.getSettings();
    
    // Get the start of day in the configured time zone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: settings.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const dateString = formatter.format(targetDate);
    return new Date(`${dateString}T00:00:00`);
  }

  getEndOfDay(date?: Date): Date {
    const targetDate = date || new Date();
    const settings = this.getSettings();
    
    // Get the end of day in the configured time zone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: settings.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const dateString = formatter.format(targetDate);
    return new Date(`${dateString}T23:59:59.999Z`);
  }

  // Form input helpers - Returns values formatted for HTML input fields
  getCurrentDateForInput(): string {
    const settings = this.getSettings();
    const now = new Date();
    
    try {
      // Get date in the configured timezone
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: settings.timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      return formatter.format(now); // Returns YYYY-MM-DD format
    } catch (error) {
      console.error('Error getting current date for input:', error);
      return new Date().toISOString().split('T')[0];
    }
  }

  getCurrentTimeForInput(): string {
    const settings = this.getSettings();
    const now = new Date();
    
    try {
      // Get time in the configured timezone
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: settings.timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      return formatter.format(now); // Returns HH:MM format
    } catch (error) {
      console.error('Error getting current time for input:', error);
      const localTime = new Date();
      return localTime.toTimeString().slice(0, 5);
    }
  }

  getCurrentDateTimeForInput(): string {
    const settings = this.getSettings();
    const now = new Date();
    
    try {
      // Get datetime in the configured timezone for datetime-local input
      const date = this.getCurrentDateForInput();
      const time = this.getCurrentTimeForInput();
      return `${date}T${time}`; // Returns YYYY-MM-DDTHH:MM format
    } catch (error) {
      console.error('Error getting current datetime for input:', error);
      return new Date().toISOString().slice(0, 16);
    }
  }

  // Convert form input values back to Date objects considering timezone
  parseFormDate(dateString: string, timeString?: string): Date {
    if (!dateString) return new Date();
    
    try {
      if (timeString) {
        return new Date(`${dateString}T${timeString}`);
      } else {
        return new Date(dateString);
      }
    } catch (error) {
      console.error('Error parsing form date:', error);
      return new Date();
    }
  }

  // Get current date and time with offset for specific scenarios
  getCurrentDateTimeWithOffset(offsetHours: number = 0): {
    date: string;
    time: string;
    datetime: string;
  } {
    const now = new Date();
    now.setHours(now.getHours() + offsetHours);
    
    const settings = this.getSettings();
    
    try {
      const dateFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: settings.timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      const timeFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: settings.timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const date = dateFormatter.format(now);
      const time = timeFormatter.format(now);
      
      return {
        date,
        time,
        datetime: `${date}T${time}`
      };
    } catch (error) {
      console.error('Error getting datetime with offset:', error);
      const fallbackDate = now.toISOString().split('T')[0];
      const fallbackTime = now.toTimeString().slice(0, 5);
      return {
        date: fallbackDate,
        time: fallbackTime,
        datetime: `${fallbackDate}T${fallbackTime}`
      };
    }
  }
}

export const timeZoneService = new TimeZoneService();
export default timeZoneService; 