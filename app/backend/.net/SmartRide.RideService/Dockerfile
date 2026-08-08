FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["SmartRide.RideService.csproj", "./"]
RUN dotnet restore "SmartRide.RideService.csproj"
COPY . .
RUN dotnet publish "SmartRide.RideService.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8082
ENV ASPNETCORE_URLS=http://+:8082
ENTRYPOINT ["dotnet", "SmartRide.RideService.dll"]
