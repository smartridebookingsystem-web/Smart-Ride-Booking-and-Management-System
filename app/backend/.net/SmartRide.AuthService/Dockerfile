FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY ["SmartRide.AuthService.csproj", "./"]
RUN dotnet restore "SmartRide.AuthService.csproj"
COPY . .
RUN dotnet publish "SmartRide.AuthService.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8081
ENV ASPNETCORE_URLS=http://+:8081
ENTRYPOINT ["dotnet", "SmartRide.AuthService.dll"]
