%intervals = [5*60, 4*60*60,   2*24*60*60, 8*24*60*60];
multiples = [0.5,  sqrt(1/2), 2^(1/4),    2];

X = [3,3,3,3,3,2,3,3];
Y = [];
p = 1;
for i = 1:length(X)
    p = p*multiples(X(i));
    Y(i) = p;
end
semilogy(Y);
hold on;

X = [3,3,3,3,2,3,3,3];
Y = [];
p = 1;
for i = 1:length(X)
    p = p*multiples(X(i));
    Y(i) = p;
end
semilogy(Y);
hold on;

X = [3,3,3,3,2,3,4,3];
Y = [];
p = 1;
for i = 1:length(X)
    p = p*multiples(X(i));
    Y(i) = p;
end
semilogy(Y);
hold on;

X = [3,3,3,3,3,3,3,3];
Y = [];
p = 1;
for i = 1:length(X)
    p = p*multiples(X(i));
    Y(i) = p;
end
semilogy(Y);
hold on;

disp("Il faut quand même 8 fois pour multiplier par 4 la durée retenue. Considérer passer le facteur Good à sqrt(2) au lieu de sqrt(sqrt(2)).");