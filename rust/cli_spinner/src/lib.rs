use std::thread;
use std::error::Error;
use std::time::Duration;
use std::sync::mpsc;
use console::{Term, style};

/// Indicator that we are waiting for user's action.
///
/// For example it is shown when we are waiting for user to confirm
/// an action on the hardware wallet.
pub fn wait_for_action_spinner() -> SpinnerBuilder {
    SpinnerBuilder::new()
        .with_spinner_chars(vec![
            style("   ").red(),
            style(">  ").red(),
            style(">> ").red(),
            style(">>>").red(),
        ])
        .with_interval_ms(300)
}

enum SpinnerMsg {
    /// Update/Change text of the spinner.
    UpdateText(String),

    /// Finish spinner with a success message.
    FinishSuccess(String),

    /// Finish spinner with a failure message.
    FinishFailure(String),
}

impl SpinnerMsg {
    /// If the message is final.
    fn is_final(&self) -> bool {
        match self {
            Self::UpdateText(_) => false,
            Self::FinishSuccess(_) => true,
            Self::FinishFailure(_) => true,
        }
    }
}

type SpinnerSender = mpsc::SyncSender<SpinnerMsg>;
type SpinnerReceiver = mpsc::Receiver<SpinnerMsg>;
type SpinnerChannel = (SpinnerSender, SpinnerReceiver);

/// Cli Spinner Builder
#[derive(Clone)]
pub struct SpinnerBuilder {
    spinner_chars: Vec<String>,
    interval: Duration,
    prefix: String,
    text: String,
}

impl SpinnerBuilder {
    pub fn new() -> Self {
        Self {
            interval: Duration::from_millis(100),
            prefix: Default::default(),
            text: Default::default(),
            spinner_chars: "-\\|/".chars()
                .map(|x| x.to_string())
                .collect()
        }
    }

    pub fn with_prefix<T>(mut self, prefix: T) -> Self
        where T: ToString,
    {
        self.prefix = prefix.to_string();
        self
    }

    pub fn with_text<T>(mut self, text: T) -> Self
        where T: ToString,
    {
        self.text = text.to_string();
        self
    }

    pub fn with_interval_ms(mut self, millis: u64) -> Self {
        self.interval = Duration::from_millis(millis);
        self
    }

    pub fn with_spinner_chars<T>(mut self, chars: Vec<T>) -> Self
        where T: ToString,
    {
        self.spinner_chars = chars.into_iter()
            .map(|x| x.to_string())
            .collect();
        self
    }

    pub fn start(self) -> Spinner {
        let (tx, rx): SpinnerChannel = mpsc::sync_channel(0);
        let spinner_chars = self.spinner_chars;
        let interval = self.interval;
        let prefix = self.prefix;
        let mut spinner_text = self.text;

        let thread_handle = thread::spawn(move || {
            let mut has_printed = false;
            for sp_char in spinner_chars.iter().cycle() {
                // current full text to display.
                let cur_text = format!(
                    "{} {}   {}",
                    prefix,
                    sp_char,
                    spinner_text,
                );
                // disable line wrapping if not on windows.
                // When line is longer than terminal window, the
                // spinner won't work.
                #[cfg(not(target_os = "windows"))]
                let cur_text = format!("\x1B[?7l{}\x1B[?7h", cur_text);

                loop {
                    match rx.try_recv() {
                        Ok(spinner_msg) => {
                            let t = Term::stderr();

                            if has_printed && spinner_msg.is_final() {
                                let _ = t.clear_last_lines(1);
                            }

                            let is_end = spinner_msg.is_final();

                            match spinner_msg {
                                SpinnerMsg::UpdateText(text) => {
                                    spinner_text = text;
                                }
                                SpinnerMsg::FinishSuccess(text) => {
                                    let _ = t.write_line(&format!(
                                        "{} {} {}",
                                        style(&prefix).bold().green(),
                                        emojies::TICK,
                                        text,
                                    ));
                                }
                                SpinnerMsg::FinishFailure(text) => {
                                    let _ = t.write_line(&format!(
                                        "{} {} {}",
                                        style(&prefix).bold().red(),
                                        emojies::X,
                                        text,
                                    ));
                                }
                            }

                            if is_end { return; } else { break; }
                        }
                        Err(mpsc::TryRecvError::Disconnected) => {
                            if has_printed {
                                let _ = Term::stderr().clear_last_lines(1);
                            }
                            return;
                        }
                        _ => break,
                    }
                }

                let t = Term::stderr();

                if has_printed {
                    let _ = t.clear_last_lines(1);
                }
                let _ = t.write_line(&cur_text);
                has_printed = true;
                thread::sleep(interval);
            }
        });

        Spinner {
            inner: Some(SpinnerInner {
                tx,
                thread_handle,
            }),
        }
    }
}

struct SpinnerInner {
    tx: SpinnerSender,
    thread_handle: thread::JoinHandle<()>,
}

impl SpinnerInner {
    fn finish(self) {
        drop(self.tx);
        let _ = self.thread_handle.join();
    }
}

pub struct Spinner {
    inner: Option<SpinnerInner>,
}

impl Spinner {
    /// Update/Change text of the spinner.
    pub fn update_text<S>(&mut self, text: S)
        where S: ToString,
    {
        if let Some(inner) = self.inner.as_ref() {
            let _ = inner.tx.send(SpinnerMsg::UpdateText(text.to_string()));
        }
    }

    /// Finish with Success without consuming self.
    fn success<S>(&mut self, message: S)
        where S: ToString,
    {
        if let Some(inner) = self.inner.take() {
            let _ = inner.tx.send(SpinnerMsg::FinishSuccess(message.to_string()));
            inner.finish();
        }
    }

    /// Finish with Failure without consuming self.
    fn fail<S>(&mut self, message: S)
        where S: ToString,
    {
        if let Some(inner) = self.inner.take() {
            let _ = inner.tx.send(SpinnerMsg::FinishFailure(message.to_string()));
            inner.finish();
        }
    }

    /// Finish the spinner with success and show the `message`.
    pub fn finish_succeed<S>(mut self, message: S)
        where S: ToString,
    {
        self.success(message);
    }

    /// Finish the spinner with failure and show the error `message`.
    #[inline]
    pub fn finish_fail<S>(mut self, message: S)
        where S: ToString,
    {
        self.fail(message);
    }

    /// If `result` is an [Err], stop the spinner and print the error
    /// as a failure message.
    ///
    /// Doesn't work with `?Sized` Error types like: `Result<T, Box<dyn Error>>`.
    // TODO: if possible make it work with Result<T, Box<dyn Error>>.
    #[inline]
    pub fn fail_if<T, E>(&mut self, result: Result<T, E>) -> Result<T, E>
        where E: Error,
    {
        if let Err(err) = &result {
            self.fail(err);
        }
        result
    }

    /// Calls drop on the spinner which will delete spinner from the terminal.
    pub fn finish(self) {
    }
}

impl Drop for Spinner {
    fn drop(&mut self) {
        if let Some(inner) = self.inner.take() {
            inner.finish();
        }
    }
}
