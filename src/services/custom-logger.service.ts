import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CustomLoggerService extends ConsoleLogger {
  private logDirectory = './logs';
  private currentWriteStream: fs.WriteStream;

  constructor() {
    super();
    this.ensureLogDirectoryExists();
    this.switchLogFile();
  }

  private ensureLogDirectoryExists(): void {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory);
    }
  }

  private getLogFileName(): string {
    const currentDate = new Date().toISOString().slice(0, 10);
    return `app-${currentDate}.log`;
  }

  private switchLogFile(): void {
    if (this.currentWriteStream) {
      this.currentWriteStream.end();
    }
    const logFilePath = path.join(this.logDirectory, this.getLogFileName());
    this.currentWriteStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  }

  private filterSensitiveData(message: string): string {
    const sensitivePatterns = [
      { regex: /password=["'](.*?)["']/g, replace: 'password="[FILTERED]"' },
    ];

    for (const pattern of sensitivePatterns) {
      message = message.replace(pattern.regex, pattern.replace);
    }

    return message;
  }

  private logToFile(level: string, message: string, trace?: string): void {
    if (
      this.getLogFileName() !==
      path.basename(this.currentWriteStream.path as string)
    ) {
      this.switchLogFile();
    }
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [${level.toUpperCase()}] ${message} ${
      trace ? `\n${trace}` : ''
    }\n`;
    this.currentWriteStream.write(logEntry);
  }

  log(message: string, context?: string) {
    const formattedMessage = this.filterSensitiveData(message);
    super.log(formattedMessage, context);
    this.logToFile('info', formattedMessage);
  }

  error(message: string, trace?: string, context?: string) {
    const formattedMessage = this.filterSensitiveData(message);
    super.error(formattedMessage, trace, context);
    this.logToFile('error', formattedMessage, trace);
  }

  warn(message: string, context?: string) {
    const formattedMessage = this.filterSensitiveData(message);
    super.warn(formattedMessage, context);
    this.logToFile('warn', formattedMessage);
  }

  onModuleDestroy(): void {
    if (this.currentWriteStream) {
      this.currentWriteStream.end();
    }
  }
}
