FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY ["SmartRide.AiService.csproj", "./"]
RUN dotnet restore "SmartRide.AiService.csproj"
COPY . .
RUN dotnet publish "SmartRide.AiService.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8084
EXPOSE 8084
ENTRYPOINT ["dotnet", "SmartRide.AiService.dll"]
