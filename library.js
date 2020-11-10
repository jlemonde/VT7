// ESPECIALLY ALL THE FUNCTIONS AND METHODS TO WRITE HTML CODE WITH JAVASCRIPT.
// AND ALSO ALL TOOLS THAT MAKE LIFE EASIER







function millisecondsToEnglish(input){
   // This is a rough transcription from milliseconds to English

   var years = Math.floor(input/(1000*3600*24*365));
   if(years > 0) return (years + ' year' + (years == 1 ? '' : 's'));

   var months= Math.floor(input/(1000*3600*24*30.4));
   if(months > 0) return (months + ' month' + (months == 1 ? '' : 's'));

   var weeks = Math.floor(input/(1000*3600*24*7));
   if(weeks > 0) return (weeks + ' week' + (weeks == 1 ? '' : 's'));

   var days  = Math.floor(input/(1000*3600*24));
   if(days > 0) return (days + ' day' + (days == 1 ? '' : 's'));

   var hours = Math.floor(input/(1000*3600));
   if(hours > 0) return (hours + ' hour' + (hours == 1 ? '' : 's'));

   var mins  = Math.floor(input/(1000*60));
   if(mins > 0) return (mins + ' minute' + (mins == 1 ? '' : 's'));

   var secs  = Math.floor(input/(1000));
   if(secs > 0) return (secs + ' second' + (secs == 1 ? '' : 's'));

   return '0 seconds';
}
