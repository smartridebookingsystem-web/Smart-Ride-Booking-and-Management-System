FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY ["SmartRide.PaymentService.csproj", "./"]
RUN dotnet restore "SmartRide.PaymentService.csproj"
COPY . .
RUN dotnet publish "SmartRide.PaymentService.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8083
ENV ASPNETCORE_URLS=http://+:8083
ENTRYPOINT ["dotnet", "SmartRide.PaymentService.dll"]
